import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { createRoom, joinChat } from "../Services/Service";
import useChatContext from "../Context/Context.jsx";

const JoinCreateChat = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    roomId: "",
    userName: "",
  });

  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  function handleFormInputChange(event) {
    setDetails({
      ...details,
      [event.target.name]: event.target.value,
    });
  }
  const handleJoin = () => {
    if (validate()) {
      joinChat(details.roomId).then((data) => {
        console.log(data);
        toast.success("Joined room successfully");
        setRoomId(details.roomId);
        setCurrentUser(details.userName);
        setConnected(true);
        navigate("/chat");
      }).catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Something went wrong";
        toast.error(errorMessage);
      });
    }
  };
  const handleCreate = () => {
    if (validate()) {
      createRoom(details.roomId)
        .then((data) => {
          console.log(data);
          toast.success("Room created successfully");
          setRoomId(details.roomId);
          setCurrentUser(details.userName);
          setConnected(true);
          navigate("/chat");
        })
        .catch((err) => {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Something went wrong";
          toast.error(errorMessage);
        });
    }
  };

  function validate() {
    if (details.roomId === "" || details.userName === "") {
      toast.error("Please fill all the fields");
      return false;
    }
    return true;
  }
  return (
    <div className="min-h-screen flex items-center bg-[url('/image.png')] bg-cover bg-center justify-center">
      <div className="border p-8 flex flex-col gap-2 w-full max-w-md rounded dark:border-gray-700 dark:bg-gray-900">
        <div>
          <img src="/chat.png" className="w-24 mx-auto" />
        </div>

        <h1 className="text-3xl text-center text-semibold">Chat App</h1>
        {/* user name div */}
        <div>
          <label htmlFor="userName" className="block font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleFormInputChange}
            id="userName"
            value={details.userName}
            name="userName"
            placeholder="Enter your name"
            type="text"
            className="focus:outline-none focus:ring-blue-500 dark:bg-gray-600 px-4 py-2 rounded-lg w-full"
          />
        </div>

        {/* room id div */}
        <div>
          <label htmlFor="roomId" className="block font-medium mb-2">
            Room ID
          </label>
          <input
            onChange={handleFormInputChange}
            id="roomId"
            type="text"
            name="roomId"
            value={details.roomId}
            placeholder="Enter Room ID"
            className="focus:outline-none focus:ring-blue-500 dark:bg-gray-600 px-4 py-2 rounded-lg w-full"
          />
        </div>

        {/* button */}
        <div className="flex justify-between gap-4 mt-2">
          <button
            onClick={handleCreate}
            className="dark:bg-blue-500 hover:bg-blue-800 w-1/2 text-gray-200 font-semibold text-md px-3 py-2 rounded-lg"
          >
            Create Room
          </button>
          <button
            onClick={handleJoin}
            className="dark:bg-orange-500 hover:bg-orange-800 w-1/2 text-gray-200 font-semibold  text-md px-3 py-2 rounded-lg"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
