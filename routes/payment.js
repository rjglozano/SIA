import express from "express";
import { payment_post} from "../controller/payment.js";

const router = express.Router()
router.post("/admin/completed/payment/:a_ID", payment_post)



export default router