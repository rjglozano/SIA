import {parseISO, format} from 'date-fns';
import { db } from "../connection.js";
import moment from 'moment'
import { typeOf } from 'react-is';

export const appointment_post = (req, res) =>{

    const patientID = req.body.patientID;
    const b_date = req.body.b_date;
    const b_time = req.body.b_time;
    const b_procedure = req.body.b_procedure;
    const b_note = req.body.b_note;
    const b_paymentStatus = "Not-Paid";
    const procedFee = 0;
    const b_update = (new Date()).toISOString();
    const b_patientType = req.body.b_patientType


    console.log(b_date)
    console.log(b_time)
    let status
    if (b_patientType === "WALK-IN"){
        status = "In Progress"
        const updated = parseISO(b_update);
        const formattedDate1 = format(updated, 'MMM dd, yyyy h:mm aa');

        
        const sqlInsert = "INSERT INTO booking_db (patientID, b_date, b_time, b_procedure, b_note, b_status, b_paymentStatus, procedFee, b_update, b_patientType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlInsert, [patientID, b_date, b_time, b_procedure, b_note, status, b_paymentStatus, procedFee, formattedDate1, b_patientType], (err, result) =>{
            if (err){
                console.log(err);
            }else {
                res.send("Values Added")
            }
        });
    } else{
        status = "Pending"

        const date = parseISO(b_date);
        const formattedDate = format(date, 'EEE, MMM dd, yyyy');
        const updated = parseISO(b_update);
        const formattedDate1 = format(updated, 'MMM dd, yyyy h:mm aa');

        const sqlInsert = "INSERT INTO booking_db (patientID, b_date, b_time, b_procedure, b_note, b_status, b_paymentStatus, procedFee, b_update, b_patientType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlInsert, [patientID, formattedDate, b_time, b_procedure, b_note, status, b_paymentStatus, procedFee, formattedDate1, b_patientType], (err, result) =>{
            if (err){
                console.log(err);
            }else {
                res.send("Values Added")
            }
        });
    }




}

export const appointment_get = (req, res) =>{
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE NOT b_status = 'Completed' AND NOT b_status = 'Cancelled' AND NOT b_status = 'R-Completed' AND NOT b_status = 'In Progress' AND NOT b_status = 'R-In Progress' ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";

    db.query(sqlGet, (error, result)=>{
        res.send(result);
    });
}


export const services_get = (req, res) =>{
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE NOT b_status = 'Completed' AND NOT b_status = 'Cancelled' AND NOT b_status = 'R-Completed' AND NOT b_status = 'Pending' AND NOT b_status = 'Rescheduled' ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";

    db.query(sqlGet, (error, result)=>{
        res.send(result);
    });
}


export const appointment_delete = (req, res) =>{
    const {a_ID} = req.params
   
    const sqlRemove = "DELETE FROM booking_db where a_ID = ?";
    db.query(sqlRemove, a_ID, (err, result) =>{
        if (err){
            console.log(err);
        }else {
            res.send(result);
        }
    });
}

export const appointment_getUser = (req, res) =>{
    const { a_ID } = req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id  WHERE a_ID = ?"
    db.query(sqlGet, a_ID ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });

}


export const appointment_updateUser = (req, res) =>{
    const {a_ID} = req.params;

    const b_date = req.body.b_date;
    const b_time = req.body.b_time;
    const b_procedure = req.body.b_procedure;
    const b_note = req.body.b_note;
    const b_status = req.body.b_status;
    const b_paymentStatus = req.body.b_paymentStatus;
    const b_update = (new Date()).toISOString();
    let procedFee = 0;

    if (b_status === "Cancelled" || b_status === "Rescheduled" || b_status === "R-Completed" ||  b_status === "R-In Progress"){
        procedFee = 100
    } else{
        procedFee = 0
    }
    const updated = parseISO(b_update);
    const formattedDate1 = format(updated, 'MMM dd, yyyy h:mm aa');



    const d = new Date(b_date);
    const v =  moment(d).format('ddd, MMM DD, YYYY'); 

    const sqlUpdate = "UPDATE booking_db SET b_date = ?, b_time = ?, b_procedure = ?, b_note = ?, b_status = ?, b_paymentStatus = ?, procedFee = ?, b_update = ? WHERE a_ID = ?";
    
    
    db.query(sqlUpdate, [v, b_time, b_procedure, b_note, b_status, b_paymentStatus, procedFee, formattedDate1, a_ID] ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });
}

export const appointment_getCompleted = (req, res) =>{
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b_status = 'Completed' OR b_status = 'R-Completed') ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";
    db.query(sqlGet ,(error, result)=>{
        res.send(result);
    });
}

export const appointment_getFullyCompleted = (req, res) =>{
    const { user_id } = req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b_status = 'Completed' OR b_status = 'R-Completed') AND (b_paymentStatus = 'Fully-Paid' or b_paymentStatus = 'Partly-Paid') AND user_id = ? ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";
    db.query(sqlGet ,user_id,(error, result)=>{
        res.send(result);
    });
}


export const appointment_getCompletedCancelled = (req, res) =>{
    const {user_id, a_ID}= req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE ((b.b_status = 'Cancelled' OR b.b_status = 'R-Completed') AND (b.b_paymentStatus = 'Not-Paid' OR b.b_paymentStatus = 'Fully-Paid' OR b.b_paymentStatus = 'Partly-Paid')) AND u.user_id = ? AND a_ID BETWEEN IFNULL((SELECT a_ID + 1 FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b.b_status = 'R-Completed' OR b.b_status = 'Completed') AND (b.b_paymentStatus = 'Fully-Paid' OR b.b_paymentStatus = 'Partly-Paid') AND u.user_id = ? AND a_ID < ? ORDER BY a_ID DESC LIMIT 1), 0) AND ?"

    
    db.query(sqlGet, [user_id, user_id, a_ID, a_ID] ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });
}

export const appointment_CancelledSum = (req, res) =>{
    const {user_id, a_ID}= req.params;
    const sqlGet = "SELECT SUM(procedFee) as totalAmount FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE ((b.b_status = 'Cancelled' OR b.b_status = 'R-Completed') AND (b.b_paymentStatus = 'Not-Paid' OR b.b_paymentStatus = 'Fully-Paid' OR b.b_paymentStatus = 'Partly-Paid')) AND u.user_id = ? AND a_ID BETWEEN IFNULL((SELECT a_ID + 1 FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b.b_status = 'R-Completed' OR b.b_status = 'Completed') AND b.b_paymentStatus = 'Fully-Paid' AND u.user_id = ? AND a_ID < ? ORDER BY a_ID DESC LIMIT 1), 0) AND ?"

    
    db.query(sqlGet, [user_id, user_id, a_ID, a_ID] ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });
}


export const appointment_getDateTime = (req, res) =>{
    const sqlGet = "SELECT b_date, b_time FROM booking_db where NOT b_status = 'Cancelled'";
    db.query(sqlGet, (error, result)=>{
        res.send(result);
    });
}

export const appointment_getPending = (req, res) =>{
    const { user_id } = req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b.b_status = 'Pending' OR b.b_status = 'Rescheduled') AND u.user_id = ? ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";
    
    

    db.query(sqlGet, user_id, (error, result)=>{
        res.send(result);
    });
}


export const appointment_getCompletedHistory = (req, res) =>{
    const { user_id } = req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b.b_status = 'Completed' OR b.b_status = 'R-Completed') AND u.user_id = ? ORDER BY STR_TO_DATE(b_date,'%a, %b %d, %Y') ASC , STR_TO_DATE(b_time, '%h:%i%p') ASC";
    db.query(sqlGet, user_id, (error, result)=>{
        res.send(result);
    });
}


export const appointment_getAppointmentCancel = (req, res) =>{
    const { user_id } = req.params;
    const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE (b.b_status = 'Cancelled' OR b.b_status = 'Rescheduled' OR b.b_status = 'R-In Progress') AND b.b_paymentStatus = 'Not-Paid'R AND u.user_id = ?"
    db.query(sqlGet, user_id ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });


}

export const appointment_addProcedures = (req, res) =>{

    const {a_ID} = req.params;
    console.log(a_ID)
    const b_procedure = req.body.b_procedure;
    const b_note = req.body.b_note;
    const toothNo = req.body.toothNo;
    const toothType = req.body.toothType;
    const procedFee = req.body.procedFee;
    console.log(procedFee)


    const sqlInsert = "INSERT INTO procedures_db (a_ID, b_procedure, b_note, toothNo, toothType, procedFee) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sqlInsert, [Number(a_ID), b_procedure, b_note, toothNo, toothType, Number(procedFee)], (err, result) =>{
        if (err){
            console.log(err);
        }else {
            res.send("Values Added")
        }
    });

}

export const appointment_getProcedures = (req, res) =>{
    const {a_ID} = req.params;
    const sqlGet = "SELECT * FROM procedures_db WHERE a_ID = ?"

    db.query(sqlGet, a_ID, (error, result)=>{
        res.send(result);
    });
}

export const appointment_getSum = (req, res) =>{
    const {a_ID} = req.params;
    
    const sqlGet = "SELECT SUM(procedFee) as totalAmount FROM procedures_db WHERE a_ID = ?"
        // const sqlGet = "SELECT * FROM booking_db as b JOIN users_db as u ON b.patientId = u.user_id WHERE b.b_status = 'Cancelled' AND b.b_paymentStatus = 'Not-Paid' AND u.user_id = ?"

    db.query(sqlGet, a_ID, (error, result)=>{
        res.send(result);
    });
}


export const procedure_delete = (req, res) =>{
    const {procedNum} = req.params
   
    const sqlRemove = "DELETE FROM procedures_db where procedNum = ?";
    db.query(sqlRemove, procedNum, (err, result) =>{
        if (err){
            console.log(err);
        }else {
            res.send(result);
        }
    });    
}



export const procedure_get = (req, res) =>{
    const { procedNum } = req.params;
    const sqlGet = "SELECT * FROM procedures_db WHERE procedNum = ?"
    db.query(sqlGet, procedNum ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });

}


export const procedure_update = (req, res) =>{
    const {procedNum} = req.params;
    const b_procedure = req.body.b_procedure;
    const b_note = req.body.b_note;
    const toothNo = req.body.toothNo;
    const toothType = req.body.toothType;
    const procedFee = req.body.procedFee;
    

    const sqlUpdate = "UPDATE procedures_db SET b_procedure = ?, b_note = ?, toothNo = ?, toothType = ?,  procedFee = ? WHERE procedNum = ?";
    db.query(sqlUpdate, [b_procedure, b_note, toothNo, toothType, procedFee, procedNum] ,(error, result)=>{
        if(error){
            console.log(error)
        }
        res.send(result);
    });
}

