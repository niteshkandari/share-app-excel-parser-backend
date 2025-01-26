import { google } from "googleapis";
import { JWT } from "google-auth-library";

export async function updateGoogleSheet(SHEET_ID: string, headers: string[], data: string[][], range = "Sheet1!A1") {
  try {
    const auth = new JWT({
      key: 
        (process.env.GOOGLE_PRIVATE_KEY as string).toString().replace(/\n/g, '\n')
      ,
      email: process.env.GOOGLE_CLIENT_EMAIL,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const values = [[...headers], ...data];
    const response: any = await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
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
