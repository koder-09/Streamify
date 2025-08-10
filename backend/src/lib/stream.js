import {StreamChat} from "stream-chat";
import "dotenv/config";

const apiKey=process.env.STEAM_API_KEY;
const apiSECRET=process.env.STEAM_API_SECRET;

if(!apiKey || !apiSECRET){
    console.error("Steam API key or secret is missing");
}

const streamClient=StreamChat.getInstance(apiKey,apiSECRET);

export const upsertStreamUser= async (userData)=>{
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error in Upserting Stream users:",error);
    }
}

export const generateStreamToken= (userId) => {

    try {
        const UserIdStr=userId.toString();
        return streamClient.createToken(UserIdStr);
        
    } catch (error) {
        console.error("Error in generating stream token:",error);
    }
}