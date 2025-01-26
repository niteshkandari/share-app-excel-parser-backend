import { Request, Response, NextFunction } from "express";
import prismaClient from "../prismaClient";
import { createExcelTemplate, parseExcel } from "../utils/excelUtilityService/excelUtility";
import { EXCEL_TEMPLATE_TYPE } from "../utils/excelUtilityService/excel-type-enum";
import { excelTemplate } from "../utils/excelUtilityService/excelTemplate";
import { updateGoogleSheet } from "../utils/excelUtilityService/googleSheetUtility";

class ExcelController {
  async uploadExcel(req: Request, res: Response, next: NextFunction, type: string, prismaModel: any, range:string) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      const { validData, errors } = await parseExcel(file.path, type);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      await prismaModel.createMany({ data: validData });
      const SHEET_ID = process.env.SHEET_ID!; 
      const headers = Object.keys(validData[0]) as string[];
      const data = validData.map((item: any) => Object.values(item)) as string[][];
      await updateGoogleSheet(SHEET_ID, headers, data, range);
      res.status(200).json({ message: "File processed and uploaded to Google Sheet successfully", data: validData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
    }
  }

  async  deleteAllRecords(res: Response, prismaModel: any, recordType: string) {
    try {
      await prismaModel.deleteMany();
      res.status(200).json({ message: `${recordType} deleted successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
    }
  }

  async getRecords(res: Response, prismaModel: any, selectFields: object) {
    try {
      const records = await prismaModel.findMany({ select: selectFields });
      res.status(200).json({ message: "Records fetched successfully", data: records });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
    }
  }

  async downloadSampleTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { excel_template_type } = req.params;

      console.log(excel_template_type);

      if (!excel_template_type) {
        return res.status(400).json({
          message: `Please provide a valid template type. Allowed values are: ${Object.values(EXCEL_TEMPLATE_TYPE).join(
            ", "
          )}.`,
        });
      }

      const templateData = excelTemplate[excel_template_type as keyof typeof EXCEL_TEMPLATE_TYPE];

      if (!templateData) {
        throw new Error(
          `Sample Template ${excel_template_type} doesn't exist in the system. Please provide a valid template type.`
        );
      }

      const excelBuffer = createExcelTemplate(templateData);
      res.setHeader("Content-Disposition", `attachment; filename=sample-template-${excel_template_type}.xlsx`);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(excelBuffer);
    } catch (error: any) {
      console.error("Error generating template:", error);

      if (error.message.includes("doesn't exist in the system")) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: "An error occurred while generating the Excel template.",
        error: JSON.stringify(error),
      });
    }
  }

  uploadFundamentals = (req: Request, res: Response, next: NextFunction) =>
    this.uploadExcel(req, res, next, EXCEL_TEMPLATE_TYPE.FUNDAMENTAL, prismaClient.recordFundamentals, "fundamental!A1");

  uploadFinancialIncomeExcel = (req: Request, res: Response, next: NextFunction) =>
    this.uploadExcel(req, res, next, EXCEL_TEMPLATE_TYPE.INCOME_STATEMENT, prismaClient.recordFinancialStatemetIncome, "incomeStatement!A1");

  uploadFinancialBalanceExcel = (req: Request, res: Response, next: NextFunction) =>
    this.uploadExcel(req, res, next, EXCEL_TEMPLATE_TYPE.BALANCE_SHEET, prismaClient.recordFinancialBalanceSheet, "balanceSheet!A1");

  uploadFinancialCashFlowStatementExcel = (req: Request, res: Response, next: NextFunction) =>
    this.uploadExcel(req, res, next, EXCEL_TEMPLATE_TYPE.CASHFLOW_STATEMENT, prismaClient.recordCashFlowStatement,"cashflowStatement!A1");

  uploadShareholdingPattern = (req: Request, res: Response, next: NextFunction) =>
    this.uploadExcel(req, res, next, EXCEL_TEMPLATE_TYPE.SHAREHOLDING_PATTERN, prismaClient.recordShareholdingPattern, "shareholdingPattern!A1");

  deleteFundamental = (req: Request, res: Response, next: NextFunction) =>
    this.deleteAllRecords(res, prismaClient.recordFundamentals, "Fundamentals");

  deleteAllFinancialIncomeStatement = (req: Request, res: Response, next: NextFunction) =>
    this.deleteAllRecords(res, prismaClient.recordFinancialStatemetIncome, "Financial Income Statements");

  deleteAllFinancialBalanceSheet = (req: Request, res: Response, next: NextFunction) =>
    this.deleteAllRecords(res, prismaClient.recordFinancialBalanceSheet, "Financial Balance Sheets");

  deleteAllFinancialCashflowStatement = (req: Request, res: Response, next: NextFunction) =>
    this.deleteAllRecords(res, prismaClient.recordCashFlowStatement, "Cash Flow Statements");

  deleteAllShareholdingPattern = (req: Request, res: Response, next: NextFunction) =>
    this.deleteAllRecords(res, prismaClient.recordShareholdingPattern, "Shareholding Patterns");

  async getFundamental(req: Request | any, res: Response, next: NextFunction) {
    try {
      const latestRecord = await prismaClient.recordFundamentals.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!latestRecord) {
        return res.status(404).json({ message: "No records found." });
      }

      res.status(200).json({ message: "Record fetched successfully", data: latestRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
    }
  }
  getAllFinancialExcel = (req: Request, res: Response, next: NextFunction) =>
    this.getRecords(res, prismaClient.recordFinancialStatemetIncome, {
      id: false,
      plStatement: true,
      year2021: true,
      year2022: true,
      year2023: true,
      year2024: true,
    });

  getAllBalanceSheetExcel = (req: Request, res: Response, next: NextFunction) =>
    this.getRecords(res, prismaClient.recordFinancialBalanceSheet, {
      id: false,
      assets: true,
      year2021: true,
      year2022: true,
      year2023: true,
      year2024: true,
    });

  getAllCashFlowStatement = (req: Request, res: Response, next: NextFunction) =>
    this.getRecords(res, prismaClient.recordCashFlowStatement, {
      id: false,
      cashFlowStatement: true,
      year2021: true,
      year2022: true,
      year2023: true,
      year2024: true,
    });

  getAllShareholdingPattern = (req: Request, res: Response, next: NextFunction) =>
    this.getRecords(res, prismaClient.recordShareholdingPattern, {
      id: false,
      shareholdingPattern: true,
      year2021: true,
      year2022: true,
      year2023: true,
      year2024: true,
    });
}

export default new ExcelController();

// import { Request, Response, NextFunction } from "express";
// import prismaClient from "../prismaClient";
// import { createExcelTemplate, parseExcel } from "../utils/excelUtilityService/excelUtility";
// import { EXCEL_TEMPLATE_TYPE } from "../utils/excelUtilityService/excel-type-enum";
// import { convertToPercentage } from "../utils";
// import { excelTemplate } from "../utils/excelUtilityService/excelTemplate";

// class ExcelController {
//   async uploadFundamentals(req: Request | any, res: Response, next: NextFunction) {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const { validData, errors } = await parseExcel(file.path, "FUNDAMENTAL");

//       if (errors.length > 0) {
//         return res.status(400).json({ errors });
//       }
//       await prismaClient.recordFundamentals.createMany({ data: validData });

//       res.status(200).json({ message: "File processed successfully", data: validData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }
//   async uploadFinancialIncomeExcel(req: Request | any, res: Response, next: NextFunction) {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const { validData, errors } = await parseExcel(file.path, "FINANCIAL_INCOME_STATEMENT");

//       if (errors.length > 0) {
//         return res.status(400).json({ errors });
//       }
//       await prismaClient.recordFinancialStatemetIncome.createMany({ data: validData });

//       res.status(200).json({ message: "File processed successfully", data: validData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async uploadFinancialBalanceExcel(req: Request | any, res: Response, next: NextFunction) {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const { validData, errors } = await parseExcel(file.path, "FINANCIAL_BALANCE_SHEET");
//       if (errors.length > 0) {
//         return res.status(400).json({ errors });
//       }
//       await prismaClient.recordFinancialBalanceSheet.createMany({ data: validData });

//       res.status(200).json({ message: "File processed successfully", data: validData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async uploadFinancialCashFlowStatementExcel(req: Request | any, res: Response, next: NextFunction) {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const { validData, errors } = await parseExcel(file.path, "FINANCIAL_CASHFLOW_SHEET");
//       if (errors.length > 0) {
//         return res.status(400).json({ errors });
//       }
//       await prismaClient.recordCashFlowStatement.createMany({ data: validData });

//       res.status(200).json({ message: "File processed successfully", data: validData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async uploadShareholdingPattern(req: Request | any, res: Response, next: NextFunction) {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     try {
//       const { validData, errors } = await parseExcel(file.path, "SHAREHOLDING_PATTERN");
//       if (errors.length > 0) {
//         return res.status(400).json({ errors });
//       }
//       await prismaClient.recordShareholdingPattern.createMany({ data: validData });

//       res.status(200).json({ message: "File processed successfully", data: validData });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async getFundamental(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const latestRecord = await prismaClient.recordFundamentals.findFirst({
//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//       if (!latestRecord) {
//         return res.status(404).json({ message: "No records found." });
//       }

//       res.status(200).json({ message: "Record fetched successfully", data: latestRecord });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async getAllFinancialExcel(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordFinancialStatemetIncome.findMany({
//         select: {
//           id: false,
//           plStatement: true,
//           year2021: true,
//           year2022: true,
//           year2023: true,
//           year2024: true,
//         },
//       });
//       res.status(200).json({ message: "Record fetched successfully", data: record });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async getAllBalanceSheetExcel(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordFinancialBalanceSheet.findMany({
//         select: {
//           id: false,
//           assets: true,
//           year2021: true,
//           year2022: true,
//           year2023: true,
//           year2024: true,
//         },
//       });
//       res.status(200).json({ message: "Record fetched successfully", data: record });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async getAllCashFlowStatement(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordCashFlowStatement.findMany({
//         select: {
//           id: false,
//           cashFlowStatement: true,
//           year2021: true,
//           year2022: true,
//           year2023: true,
//           year2024: true,
//         },
//       });
//       res.status(200).json({ message: "Record fetched successfully", data: record });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async getAllShareholdingPattern(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const records = await prismaClient.recordShareholdingPattern.findMany({
//         select: {
//           id: false,
//           shareholdingPattern: true,
//           year2021: true,
//           year2022: true,
//           year2023: true,
//           year2024: true,
//         },
//       });

//       const convertedRecords = records.map((record: any) => ({
//         shareholdingPattern: record.shareholdingPattern,
//         year2021: convertToPercentage(record.year2021),
//         year2022: convertToPercentage(record.year2022),
//         year2023: convertToPercentage(record.year2023),
//         year2024: convertToPercentage(record.year2024),
//       }));

//       res.status(200).json({ message: "Record fetched successfully", data: convertedRecords });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async downloadSampleTemplate(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const { excel_template_type } = req.params;

//       console.log(excel_template_type)
//       if (!excel_template_type) {
//         return res.status(400).json({
//           message: `Please provide a valid template type. Allowed values are: ${Object.values(EXCEL_TEMPLATE_TYPE).join(", ")}.`,
//         });
//       }
//       const excelTemplateDataGetter = () => {
//         switch (excel_template_type) {
//           case EXCEL_TEMPLATE_TYPE.FUNDAMENTAL:
//             return excelTemplate[EXCEL_TEMPLATE_TYPE.FUNDAMENTAL];
//           case EXCEL_TEMPLATE_TYPE.BALANCE_SHEET:
//             return excelTemplate[EXCEL_TEMPLATE_TYPE.BALANCE_SHEET];
//           case EXCEL_TEMPLATE_TYPE.CASHFLOW_STATEMENT:
//             return excelTemplate[EXCEL_TEMPLATE_TYPE.CASHFLOW_STATEMENT];
//           case EXCEL_TEMPLATE_TYPE.INCOME_STATEMENT:
//             return excelTemplate[EXCEL_TEMPLATE_TYPE.INCOME_STATEMENT];
//           case EXCEL_TEMPLATE_TYPE.SHAREHOLDING_PATTERN:
//             return excelTemplate[EXCEL_TEMPLATE_TYPE.SHAREHOLDING_PATTERN];
//           default:
//             throw new Error(
//               `Sample Template ${excel_template_type} doesn't exist in the system. Please provide a template type from ${Object.values(
//                 EXCEL_TEMPLATE_TYPE
//               ).join(", ")}.`
//             );
//         }
//       };

//      // Function to retrieve template data
//     // const getTemplateData = () => {
//     //   const templateData = excelTemplate[excel_template_type as keyof typeof EXCEL_TEMPLATE_TYPE];

//     //   if (!templateData) {
//     //     throw new Error(
//     //       `Template '${excel_template_type}' doesn't exist. Valid template types are: ${Object.values(EXCEL_TEMPLATE_TYPE).join(", ")}.`
//     //     );
//     //   }

//     //   return templateData;
//     // };

//       // Generate the Excel file using the utility function
//       const excelBuffer = createExcelTemplate(excelTemplateDataGetter());
//       res.setHeader("Content-Disposition", `attachment; filename=sameple-template-${excel_template_type}.xlsx`);
//       res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//       res.send(excelBuffer);
//     } catch (error:any) {
//       console.error("Error generating template:", error);

//       if (error.message.includes("doesn't exist in the system")) {
//         return res.status(400).json({
//           message: error.message, // Send the specific error from the switch statement
//         });
//       }

//       // Send error response
//       res.status(500).json({
//         message: "An error occurred while generating the Excel template.",
//         error: JSON.stringify(error),
//       });

//       next(error);
//     }
//   }

//   async deleteFundamental(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       await prismaClient.recordFundamentals.deleteMany();
//       res.status(200).json({ message: "Fundamental deleted successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async deleteAllFinancialIncomeStatement(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordFinancialStatemetIncome.deleteMany({});
//       res.status(200).json({ message: "Deleted all record successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async deleteAllFinancialBalanceSheet(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordFinancialBalanceSheet.deleteMany({});
//       res.status(200).json({ message: "Deleted all record successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async deleteAllFinancialCashflowStatement(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordCashFlowStatement.deleteMany({});
//       res.status(200).json({ message: "Deleted all record successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }

//   async deleteAllShareholdingPattern(req: Request | any, res: Response, next: NextFunction) {
//     try {
//       const record = await prismaClient.recordShareholdingPattern.deleteMany({});
//       res.status(200).json({ message: "Deleted all record successfully" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error", message: JSON.stringify(error) });
//     }
//   }
// }

// export default new ExcelController();
