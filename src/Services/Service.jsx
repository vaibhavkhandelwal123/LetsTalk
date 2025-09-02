import { httpClient } from "../Config/AxiosHelper"

const createRoom = async (roomDetails)=>{
    return (await httpClient.post('/rooms/create',roomDetails)).data;
}

const joinChat = async(roomId) =>{
    return (await httpClient.get(`/rooms/${roomId}`));
}

const fetchMessages = async (roomId,size=50,page=0) => {
    return (await httpClient.get(`/rooms/${roomId}/messages?size=${size}&page=${page}`)).data;
}

export {createRoom,joinChat,fetchMessages};