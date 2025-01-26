import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as path from "path";

export async function updateGoogleSheet(SHEET_ID: string, headers: string[], data: string[][], range = "Sheet1!A1") {
  try {
  
    console.log(__dirname,  "dirname")
    const auth = new JWT({
      keyFile: path.join(__dirname, '../../../node-share-app-service-d073481ba24b.json'), 
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
    });
    const sheets = google.sheets({ version: "v4", auth });    
    const values = [[...headers], ...data];
    const response: any = await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW", // "RAW" or "USER_ENTERED"
      requestBody: {
        values: values,
      },
    });

    console.log("Sheet updated successfully:", response.data);
  } catch (error: any) {
    console.error("Error updating Google Sheet:", error.message);
  }
}

