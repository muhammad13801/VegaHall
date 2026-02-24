import axios from "axios";

const API_URL = "http://192.168.88.7:3000/auth"; // Use local IP if testing on device

interface RegisterUserData {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
}

interface VerifyCodeData {
  email: string;
  code: string;
}

/*export const checkEmail = async(email: string) =>{
  try{
    const respone = await fetch(`$API_BASE_URL}/register/exists`
  }
}*/

export const registerUser = async (userData: RegisterUserData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    console.log(response.data);
    return response.data;
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};

export const verifyCode = async ({ email, code }: VerifyCodeData) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, { email, code });
    console.log(response.data);
    console.log("The email is this: " + email, " The code is this: " + code);
    return response.data;
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};

export const resendCode = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/resend-code`, { email });
    console.log(response.data);
    return response.data;
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};
