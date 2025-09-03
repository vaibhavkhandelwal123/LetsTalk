import axios from "axios";
import { baseURL } from "./AxiosHelper";
const getFileUrl = async (fileId) => {
    try {
      const res = await axios.get(`${baseURL}/api/files/${fileId}`);
      const { data, contentType } = res.data;

      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });

      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("File fetch failed", err);
      return null;
    }
  };

  export { getFileUrl };