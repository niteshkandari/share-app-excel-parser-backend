import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";
export async function updateGoogleSheet(headers: string[], data: string[][], range = "Sheet1!A1") {
  try {
    // const auth = new JWT({
    //   key: 
    //     process.env.GOOGLE_PRIVATE_KEY 
    //   ,
    //   email: process.env.GOOGLE_CLIENT_EMAIL,
    //   scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    // });

    const decodedServiceAccount = Buffer.from(process.env.ENCODED_SECRET!, 'base64').toString('utf-8');
    const credentials = JSON.parse(decodedServiceAccount);
    console.log(range, process.env.SHEET_ID)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    // Get the authorized client
    const authClient = await auth.getClient() as sheets_v4.Options["auth"];

    const sheets = google.sheets({ version: "v4", auth:authClient });
    const values = [[...headers], ...data];
    const response: any = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID!,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: values,
      },
    });

    console.log("Sheet updated successfully:", response.data);
  } catch (error: any) {
    console.error("Error updating Google Sheet:", error.message);
  }
}
