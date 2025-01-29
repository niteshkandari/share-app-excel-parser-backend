import { google, sheets_v4 } from "googleapis";
// import cron from "node-cron";

let sheetsInstance: sheets_v4.Sheets | null = null;

async function getGoogleSheetInstance() {
  if (sheetsInstance) return sheetsInstance;
  // const auth = new JWT({
  //   key:
  //     process.env.GOOGLE_PRIVATE_KEY
  //   ,
  //   email: process.env.GOOGLE_CLIENT_EMAIL,
  //   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  // });
  const decodedServiceAccount = Buffer.from(process.env.ENCODED_SECRET!, "base64").toString("utf-8");
  const credentials = JSON.parse(decodedServiceAccount);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets", 
           "https://www.googleapis.com/auth/script.external_request"],
  });

  const authClient = (await auth.getClient()) as sheets_v4.Options["auth"];
  sheetsInstance = google.sheets({ version: "v4", auth: authClient });
  return sheetsInstance;
}

export const updateGoogleSheet =
  (headers: string[] = [], data: string[][] = [[], []]) =>
  (range = "Sheet1!A1") =>
  async (shouldClearSheet = false) => {
    try {
      const sheets = await getGoogleSheetInstance();
      const values = [[...headers], ...data];
      if (shouldClearSheet) {
        const response = await sheets.spreadsheets.values.clear({
          spreadsheetId: process.env.SHEET_ID!,
          range,
        });
        return { message: "Sheet cleared successfully:", data: response.data };
      }
      const response: any = await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SHEET_ID!,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: values,
        },
      });
      return { message: "Sheet updated successfully:", data: response.data };
    } catch (error: any) {
      return { message: "Error updating Google Sheet:", error: error.message };
    }
  };

// async function fetchSheetData() {
// const sheetId = "YOUR_SHEET_ID";
// const range = "Sheet1!A1:Z100";
// const sheet = await getGoogleSheetInstance()
// const response = await sheet.spreadsheets.values.get({ spreadsheetId: sheetId, range });
// const rows = response.data.values || [];
// console.log("Hey yp")
// for (const row of rows) {
//   const existingRecord = await SheetModel.findOne({ data: row });
//   if (!existingRecord) {
//     await new SheetModel({ data: row }).save();
//     console.log("New data inserted:", row);
//   }
// }
// }

// Run the script every 5 minutes
// cron.schedule("*/5 * * * * *", fetchSheetData);
