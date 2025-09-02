import { MdAttachFile, MdSend } from "react-icons/md";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import useChatContext from "../Context/Context.jsx";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseURL } from "../Config/AxiosHelper";
import { fetchMessages } from "../Services/Service.jsx";
import {timeAgo} from "../Config/Helper"
import { TiTick } from "react-icons/ti";
const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const { roomId, currentUser, connected, setConnected,setRoomId,setCurrentUser } = useChatContext();
  const [currUser] = useState(currentUser);

  useEffect(() => {
    if (!connected || !roomId || !currentUser) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);
  const handleLeave = () => {
    stompClient.disconnect();
    setConnected(false);
    setRoomId(null);
    setCurrentUser(null);
    toast.success("Disconnected");
    navigate("/");
  };

  useEffect(()=>{
    fetchMessages(roomId).then((data) => {
      setMessages(data);
    }).catch((err) => {
      console.log(err);
    });
  },[roomId])
  const sendMessage = () => {
    if (stompClient && connected && input.trim() !== "") {
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify({
        sender: currentUser,
        content: input,
        roomId: roomId
      }));
      setInput("");
    }
  }

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  return (
    <div className="">
      {/* header */}
      <header className="flex fixed w-full h-20 dark:bg-gray-800 items-center border py-5 dark:border-gray-700 shadow justify-around">
        <div className="">
          <h1 className="text-xl font-semibold">
            Room : <span>{roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            User : <span>{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLeave}
            className="dark:bg-red-500 dark:hover:bg-red-700 text-md font-semibold text-white px-3 py-2 rounded"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* message section */}
      <main ref={chatBoxRef} className="py-20 bg-[url('/bg.jpg')] bg-cover bg-no-repeat px-10 overflow-auto w-2/3 dark:bg-slate-600 mx-auto h-screen">
        <div className="message_container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === currUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`my-2 ${
                  message.sender === currUser ? "bg-green-800" : "bg-blue-800"
                } p-2 max-w-xs rounded`}
              >
                <div className="flex flex-row gap-2">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${message.sender}`} 
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">{message.sender}</p>
                    <p>{message.content}</p>
                    <div className="text-xs flex gap-2 items-center justify-end text-gray-300"><TiTick/> {timeAgo(message.timeStamp)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* input */}
      <div className="fixed bottom-2 p-2 w-full h-16">
        <div className="flex rounded-2xl gap-5 justify-between pr-1 items-center w-2/3 mx-auto dark:bg-gray-800">
          <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
            type="text"
            className="px-4 w-full py-3 rounded-2xl outline-none dark:border-gray-800 dark:bg-gray-700"
            placeholder="Type your message..."
          />
          <div className="flex gap-2">
            <button
              type="file"
              className="dark:bg-purple-600  dark:hover:bg-purple-700 rounded-full font-semibold flex items-center justify-center h-10 w-10"
            >
              <MdAttachFile size={20} />
            </button>
            <button onClick={sendMessage} className="dark:bg-green-500 dark:hover:bg-green-700 rounded-full font-semibold flex items-center justify-center h-10 w-10">
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
