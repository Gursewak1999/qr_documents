import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import * as htmlToImage from "html-to-image";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


async function dataURItoBlob(dataURI) {
  const blob = await (await fetch(dataURI)).blob();
  return blob;
}
const fileId = "file_" + uuid();

export default function Home() {
  const [selectedBase64, setSelectedFileBase64] = useState<string | ArrayBuffer>();
  const [selectedBlob, setSelectedFileBlob] = useState<File>();
  const [loadedImage, setLoadedImage] = useState("");
  const [finalUrl, setFinalUrl] = useState("");

  const setUrl = (id) => {
    setFinalUrl("https://itcareerinfo.co.in/db_data_search/verify.php?c=" + id);
  };

  useEffect(() => {
    console.log("FileId", fileId);
    // setUrl(fileId);
  }, [fileId])
  const onQrLoaded = async () => {
    // setTimeout(async () => {
    console.log("handlePrint", componentRef.current);
    // makeImage();
    const downloadLink = document.createElement("a");
    downloadLink.download = selectedBlob.name.split(".")[0] + "_qr.jpg";
    const dataUrl = await htmlToImage.toJpeg(componentRef.current);
    downloadLink.href = dataUrl;

    const convertedFile = await dataURItoBlob(dataUrl);
    const formData = new FormData();
    formData.append("image", convertedFile, "convertedFile");
    formData.append("id", fileId);

    // downloadLink.click();
    console.log("dataUrl", dataUrl);

    axios.post("https://itcareerinfo.co.in/db_data_search/upload.php", formData)
      .then(() => {
        console.log("file uploaded")
        // setUrl(selectedFile.id)
        downloadLink.click();
      });

    // handlePrint();
    // }, 500);
  }
  const onFileChange = async (event) => {
    // Update the state

    //get the file
    const selectedFile = event.target.files[0];
    setSelectedFileBlob(event.target.files[0]);

    console.log(selectedFile);

    //show qr with file name
    setUrl(fileId);

    var reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = function () {
      // console.log(reader.result);//base64encoded string
      setSelectedFileBase64(reader.result);
      const url = URL.createObjectURL(selectedFile);
      setLoadedImage(url);
      // 
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
      window.alert("An unknown error has occurred");
    };
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => {
      return componentRef.current ? componentRef.current : null;
    },
  });

  const qrWidth = 120,
    qrHeight = 120;

  return (
    <div className="container">
      <div className="hcenter">
        <h2>Convert Certificate to QR code</h2>
      </div>
      <input
        type="file"
        name="uploadedImage"
        accept="image/*"
        onChange={onFileChange}
      />
      {/* <button onClick={onFileUpload}>
        Upload!
      </button> */}

      <div className="hcenter" >
        <div style={{ position: "relative" }} ref={componentRef}>
          {loadedImage && (
            <div
              style={{
                overflow: "hidden",
                width: qrWidth + "px",
                height: qrHeight + "px",
                position: "absolute",
                top: "17%",
                right: "4%",
                outline: "2px solid black",
              }}
            >
              {/* <img src={"https://chart.googleapis.com/chart?chs=" + qrWidth + "x" + qrHeight + "&cht=qr&chl=" + loadedImage} style={{ scale: "1.525" }} /> */}
              <img
                src={
                  "https://chart.googleapis.com/chart?chs=" +
                  qrWidth +
                  "x" +
                  qrHeight +
                  "&cht=qr&chl=" +
                  finalUrl
                }
                onLoad={onQrLoaded}
                style={{ scale: "1.525" }}
              />
            </div>
          )}
          <img src={loadedImage} style={{ height: "98vh" }} />
        </div>
      </div>

      <button
        style={{ margin: "10px" }}
        onClick={() => {
          handlePrint();
        }}
      >
        Print
      </button>
    </div>
  );
}
