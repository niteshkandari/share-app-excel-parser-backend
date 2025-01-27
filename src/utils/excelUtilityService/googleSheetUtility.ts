import { google, sheets_v4 } from "googleapis";
export const updateGoogleSheet =
  (headers: string[] = [], data: string[][] = [[], []]) =>
  (range = "Sheet1!A1") =>
  async (shouldClearSheet = false) => {
    try {
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
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      // Get the authorized client
      const authClient = (await auth.getClient()) as sheets_v4.Options["auth"];

      const sheets = google.sheets({ version: "v4", auth: authClient });
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
