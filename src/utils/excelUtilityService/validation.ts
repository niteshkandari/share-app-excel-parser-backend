import { z } from "zod";
import { EXCEL_TEMPLATE_TYPE } from "./excel-type-enum";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN format
const isinRegex = /^IN[0-9A-Z]{10}$/; // ISIN format
const cinRegex = /^[UL][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;

// Define a Zod schema for validating records
export const financialIncomeSchema = z.object({
  plStatement: z.preprocess(
    (value) => String(value).trim(),
    z.string().min(1, { message: "Column 'PL Statement' is required." })
  ),
  year2021: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2021' is required." })),
  year2022: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2022' is required." })),
  year2023: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2023' is required." })),
  year2024: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2024' is required." })),
});

const financialBalance = z.object({
  assets: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column 'Assets' is required." })),
  year2021: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2021' is required." })),
  year2022: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2022' is required." })),
  year2023: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2023' is required." })),
  year2024: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2024' is required." })),
});

const financialCashFlowSchema = z.object({
  cashFlowStatement: z.preprocess(
    (value) => String(value).trim(),
    z.string().min(1, { message: "Column 'Cash Flow Statement' is required." })
  ),
  year2021: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2021' is required." })),
  year2022: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2022' is required." })),
  year2023: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2023' is required." })),
  year2024: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2024' is required." })),
});

const shareholdingPattern = z.object({
  shareholdingPattern: z.preprocess(
    (value) => String(value).trim(),
    z.string().min(1, { message: "Column 'Cash Flow Statement' is required." })
  ),
  year2021: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2021' is required." })),
  year2022: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2022' is required." })),
  year2023: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2023' is required." })),
  year2024: z.preprocess((value) => String(value).trim(), z.string().min(1, { message: "Column '2024' is required." })),
});

const recordFundamentalsSchema = z.object({
  shareValue: z.preprocess((value) => String(value).trim(), z.string().optional()),
  lotSize: z.preprocess((value) => String(value).trim(), z.string().optional()),
  weekHigh: z.preprocess((value) => String(value).trim(), z.string().optional()),
  weekLow: z.preprocess((value) => String(value).trim(), z.string().optional()),
  depository: z.preprocess((value) => String(value).trim(), z.string().optional()),
  panNumber: z
    .preprocess((value) => String(value).trim(), z.string().regex(panRegex, { message: "Invalid PAN number format." }))
    .optional(),
  isinNumber: z
    .preprocess((value) => String(value).trim(), z.string().regex(isinRegex, { message: "Invalid ISIN number format." }))
    .optional(),
  cin: z
    .preprocess((value) => String(value).trim(), z.string().regex(cinRegex, { message: "Invalid CIN number format." }))
    .optional(),
  rta: z.preprocess((value) => String(value).trim(), z.string().optional()),
  marketCap: z.number().optional(),
  peRatio: z.number().optional(),
  pbRatio: z.number().optional(),
  debtToEquity: z.preprocess((value) => String(value).trim(), z.string().optional()),
  roe: z.number().optional(),
  bookValue: z.number().optional(),
  faceValue: z.number().optional(),
  valuation: z.preprocess((value) => String(value).trim(), z.string().optional()),
  totalShares: z.number().optional(),
});
export const validateRecord = (record: any, typeOfExcelSheet: string) => {
  try {
    if (typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.INCOME_STATEMENT) {
      financialIncomeSchema.parse(record);
    } else if (typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.BALANCE_SHEET) {
      financialBalance.parse(record);
    } else if (typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.CASHFLOW_STATEMENT) {
      financialCashFlowSchema.parse(record);
    } else if (typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.SHAREHOLDING_PATTERN) {
      shareholdingPattern.parse(record);
    } else if (typeOfExcelSheet === EXCEL_TEMPLATE_TYPE.FUNDAMENTAL) {
      recordFundamentalsSchema.parse(record);
    }
    return null; // No errors
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return error.errors.map((err) => `${err.path.join(" -> ")}: ${err.message}`).join(", ");
    }
    return "Unknown validation error.";
  }
};
