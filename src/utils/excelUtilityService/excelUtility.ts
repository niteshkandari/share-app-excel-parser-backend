import xlsx from "xlsx";
import { validateRecord } from "../excelUtilityService/validation";
import { EXCEL_TEMPLATE_TYPE } from "./excel-type-enum";

const sanitizeKeysInArray = (data) => {
  return data.map((obj) => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key.replace(/\n/g, ""), value])
    );
  });
};


export const parseExcel = async (filePath: string, typeOfExcelSheet : string) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("The Excel file does not contain any sheets.");
    }

    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet);
    const errors: string[] = [];
    const validData: any[] = [];

    if(typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.FUNDAMENTAL && data.length > 1) {
      errors.push(`Error, Cannot upload more than one row.`);
      return { validData: [], errors }; 
    }
  
    const sanitizedData = sanitizeKeysInArray(data)

    for (const record of sanitizedData) {    
      const error = validateRecord(record, typeOfExcelSheet);
      if (error) {
        errors.push(`Error in record: ${JSON.stringify(record)} - ${error}`);
      } else {
        validData.push(record);
      }
    }

    return { validData, errors };
  } catch (error) {
    console.error("Error parsing the Excel file:", error);
    throw new Error("Failed to parse the Excel file.");
  }
};


export const createExcelTemplate = (templateData: Array<object>): Buffer => {
  try {
    // Create a new workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(templateData);

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

    // Generate the Excel file as a buffer
    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  } catch (error) {
    console.error("Error creating the Excel template:", error);
    throw new Error("Failed to create the Excel template.");
  }
};
