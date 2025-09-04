import { MdAttachFile, MdSend } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import useChatContext from "../Context/Context.jsx";
import { toast } from "react-hot-toast";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseURL, httpClient } from "../Config/AxiosHelper";
import { fetchMessages } from "../Services/Service.jsx";
import { timeAgo } from "../Config/Helper";
import { TiTick } from "react-icons/ti";
import axios from "axios";
import { FaDownload } from "react-icons/fa";
import { getFileUrl } from "../Config/Utils.jsx";
import { useMediaQuery } from '@mantine/hooks';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [fileUrls, setFileUrls] = useState({});
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();
  const [currUser] = useState(currentUser);
  const matches = useMediaQuery("(max-width: 400px)");

  // if page reload logout the user
  useEffect(() => {
    if (!connected || !roomId || !currentUser) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  // connect to websocket
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);

      client.connect(
        {},
        () => {
          setStompClient(client);
          toast.success("Connected");

          client.subscribe(`/topic/room/${roomId}`, (message) => {
            const newMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          });
        },
        (error) => {
          console.error("WebSocket error", error);
          toast.error("WebSocket connection failed");
        }
      );
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId, connected]);


  // leave button handle
  const handleLeave = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    setConnected(false);
    setRoomId(null);
    setCurrentUser(null);
    toast.success("Disconnected");
    navigate("/");
  };

  // fetch messages 
  useEffect(() => {
    fetchMessages(roomId)
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));
  }, [roomId]);

  // load the files extracting by their urls
  useEffect(() => {
    const loadFiles = async () => {
      for (const msg of messages) {
        if (msg.fileType === "FILE" && !fileUrls[msg.content]) {
          const url = await getFileUrl(msg.content);
          if (url) {
            setFileUrls((prev) => ({ ...prev, [msg.content]: url }));
          }
        }
      }
    };
    loadFiles();
  }, [messages]);

  // send messages and files
  const sendMessage = async () => {
    if (!input && !file) return;

    try {
      let messageToSend = {
        sender: currentUser,
        content: input,
        roomId,
        type: "TEXT",
      };

      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1];

          const response = await axios.post(`${baseURL}/api/files/upload`, {
            fileName: file.name,
            contentType: file.type,
            data: base64Data,
          });

          messageToSend = {
            sender: currentUser,
            content: response.data.id,
            roomId,
            fileType: "FILE",
            fileName: file.name,
          };

          stompClient.send(
            `/app/sendMessage/${roomId}`,
            {},
            JSON.stringify(messageToSend)
          );

          setFile(null);
          setInput("");
        };
        reader.readAsDataURL(file);
        return;
      }

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(messageToSend)
      );
      setInput("");
    } catch (error) {
      console.error("Failed to send", error);
      toast.error("Failed to send message");
    }
  };


  // reference the chatbox to autoscroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/?roomId=${roomId}`);
    toast.success("Room ID copied to clipboard");
  };

  return (
    <div className="bg-gradient-to-t from-blue-800 to-purple-800">
      {/* header */}
      <header className="flex fixed [@media(max-width:400px)]:flex-col w-full [@media(max-width:400px)]:h-30 h-20 z-10 text-white dark:bg-gray-800 items-center border py-5 dark:border-gray-700 shadow justify-around">
        <div className="[@media(max-width:400px)]:flex [@media(max-width:400px)]:gap-5 flex gap-10">
          <div>
          <h1 className="text-xl font-semibold [@media(max-width:400px)]:text-lg">
            Room : <span>{roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold [@media(max-width:400px)]:text-lg">
            User : <span>{currentUser}</span>
          </h1>
        </div>
        </div>
        <div className=" flex [@media(max-width:400px)]:gap-5 gap-2">
          <button
            onClick={handleCopy}
            className="dark:bg-green-600 dark:hover:bg-green-700 text-md font-semibold text-white px-3 py-2 rounded"
          >
            Share Room
          </button>
          <button
            onClick={handleLeave}
            className="dark:bg-red-600 dark:hover:bg-red-700 text-md font-semibold text-white px-3 py-2 rounded"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* message section */}
      <main
        ref={chatBoxRef}
        className="py-20 bg-[url('/bg.jpg')] [@media(max-width:400px)]:w-full bg-cover bg-no-repeat px-10 overflow-auto w-2/3 dark:bg-slate-600 mx-auto h-screen"
      >
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
                } px-2 py-1 max-w-xl rounded`}
              >
                <div className="flex flex-row gap-2">
                  <img
                    src={`https://avatar.iran.liara.run/username?username=${message.sender}`}
                    className="h-10 w-10 mt-5 rounded-full"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-white">
                      {message.sender}
                    </p>

{/* message type according to the file type */}
                    {message.fileType === "FILE" ? (
                      message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        fileUrls[message.content] ? (
                          <div>
                            <img
                              src={fileUrls[message.content]}
                              alt={message.fileName}
                              className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer"
                              onClick={() =>
                                window.open(fileUrls[message.content], "_blank")
                              }
                            />
                            <a
                              href={fileUrls[message.content]}
                              download={message.fileName}
                              className="px-2 mt-5 py-1 text-xs bg-green-600 hover:bg-green-700 rounded flex w-8 h-8 text-white"
                            >
                              <FaDownload size={20} />
                            </a>
                          </div>
                        ) : (
                          <p className="text-gray-400">Loading image...</p>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">
                            {message.fileName || "file"}
                          </span>
                          {fileUrls[message.content] ? (
                            <a
                              href={fileUrls[message.content]}
                              download={message.fileName}
                              className="px-2 py-1 text-xs flex w-8 h-8 bg-green-600 hover:bg-green-700 rounded text-white"
                            >
                              <FaDownload size={20} />
                            </a>
                          ) : (
                            <span className="text-gray-400">Loading...</span>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-white flex-wrap flex">
                        {message.content}
                      </p>
                    )}

                    <div className="text-xs flex gap-2 items-center justify-end text-gray-300">
                      {timeAgo(message.timeStamp)}
                      <span className="flex flex-row gap-0">
                        <TiTick />
                        <TiTick />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      

      {/* input */}
      <div className="fixed bottom-12 p-2 [@media(max-width:400px)]:flex [@media(max-width:400px)]:flex-col w-full h-16">
        {file && matches && (
            <div className="text-white border rounded-full p-2 mb-2 flex items-center justify-center gap-2">
              <p>{file.name}</p>
              <span
                onClick={() => setFile(null)}
                className="cursor-pointer text-red-700"
              >
                X
              </span>
            </div>
          )}
        <div className="flex rounded-2xl gap-5 justify-between pr-1 [@media(max-width:400px)]:w-full items-center w-2/3 mx-auto dark:bg-black">
          {file && !matches && (
            <div className="text-white border rounded-full p-2 flex items-center justify-center gap-2">
              <p>{file.name}</p>
              <span
                onClick={() => setFile(null)}
                className="cursor-pointer text-red-700"
              >
                X
              </span>
            </div>
          )}

          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="px-4 w-full py-3 text-white rounded-2xl outline-none placeholder:text-white dark:bg-gray-800"
            placeholder="Type your message..."
          />
          <div className="flex [@media(max-width:400px)]:flex-row gap-2">
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/png,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              
            />
            <button
              className="dark:bg-purple-500 dark:hover:bg-purple-700 rounded-full font-semibold flex items-center justify-center [@media(max-width:400px)]:h-8 [@media(max-width:400px)]:w-8 h-10 w-10"
              onClick={() => document.getElementById("fileInput").click()}
              type="button"
            >
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              className="dark:bg-green-500 dark:hover:bg-green-700 rounded-full font-semibold flex items-center justify-center [@media(max-width:400px)]:h-8 [@media(max-width:400px)]:w-8 h-10 w-10"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
