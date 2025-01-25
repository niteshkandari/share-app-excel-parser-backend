import { Router } from "express";
import ExcelController from "../controllers/excelController";
import { checkAuthentication } from "../middleware/auth";
import { upload } from "../middleware/upload";


const excelTemplateRouter:Router = Router();

//Routes for uploading excel

excelTemplateRouter.post("/upload/fundamentals", upload.single("record-fundamentals"), ExcelController.uploadFundamentals);

excelTemplateRouter.post("/upload/financial/income-statement", upload.single("record-financial-income-statement"), ExcelController.uploadFinancialIncomeExcel);

excelTemplateRouter.post("/upload/financial/balance-sheet", upload.single("record-financial-balance-sheet"), ExcelController.uploadFinancialBalanceExcel);

excelTemplateRouter.post("/upload/financial/cashflow-statement", upload.single("record-financial-cashflow-statement"), ExcelController.uploadFinancialCashFlowStatementExcel);

excelTemplateRouter.post("/upload/shareholding-pattern", upload.single("record-shareholding-pattern"), ExcelController.uploadShareholdingPattern);


//Routes for fetching excel
excelTemplateRouter.get("/get/fundamental", ExcelController.getFundamental)

excelTemplateRouter.get("/get/financial/income-statement", ExcelController.getAllFinancialExcel)

excelTemplateRouter.get("/get/financial/balance-sheet", ExcelController.getAllBalanceSheetExcel)

excelTemplateRouter.get("/get/financial/cashflow-statement", ExcelController.getAllCashFlowStatement) 

excelTemplateRouter.get("/get/shareholding-pattern", ExcelController.getAllShareholdingPattern) 

//Routes for downloading sample template
excelTemplateRouter.get("/download-sample-template/:excel_template_type", ExcelController.downloadSampleTemplate);


//Routes for deleting excel
excelTemplateRouter.delete("/delete/fundamental", ExcelController.deleteFundamental);

excelTemplateRouter.delete("/delete/all/financial/income-statement", ExcelController.deleteAllFinancialIncomeStatement);

excelTemplateRouter.delete("/delete/all/financial/balance-sheet", ExcelController.deleteAllFinancialBalanceSheet);

excelTemplateRouter.delete("/delete/all/financial/cashflow-statement", ExcelController.deleteAllFinancialCashflowStatement);

excelTemplateRouter.delete("/delete/all/shareholding-pattern", ExcelController.deleteAllShareholdingPattern);


export default excelTemplateRouter;