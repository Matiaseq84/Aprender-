import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    studentName: {type:String,required:true},
    studentLastname:{type:String,required:true},
    dni: {type:String,required:true, unique:true},
    email: {type:String,required:true, unique:true},
    tel: {type:String,required:true} 
},{timestamp: true})

const Student=mongoose.model('Student', StudentSchema) 
export default Student