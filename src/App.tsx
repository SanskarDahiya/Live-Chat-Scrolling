import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import ChatWrapper from "./ChatWrapper";
import ChatWrapper2 from "./ChatWrapper2";
import ChatWrapper3 from "./ChatWrapper3";
import { USERNAMES, MESSAGES } from "./RANDOM";

const LOGICS = {
  Curr: ChatWrapper,
  // Curr_With_Throttle: ChatWrapper2,
  New: ChatWrapper3
};

const MessageUI = ({ message }: any) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          minHeight: "20px",
          maxWidth: "100%",
          color: "white",
          margin: "12px 4px",
          alignItems: "center",
          justifyContent: "flex-start"
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center"
          }}
        >
          <img
            src={message.profile.avatar}
            alt="avatar"
            height="25px"
            width="25px"
            style={{
              marginRight: "4px",
              // border: "1px solid white",
              borderRadius: "999px",
              objectFit: "cover"
            }}
          />
          <div
            style={{
              wordBreak: "break-word",
              textAlign: "start",
              verticalAlign: "start",
              ...(!message.message
                ? {
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center"
                  }
                : {})
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "500",
                marginRight: "4px"
              }}
            >
              {message.profile.username}
            </span>
            {message.message ? (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  marginRight: "4px"
                }}
              >
                {message.message}
              </span>
            ) : (
              <span
                style={{
                  minHeight: "50px",
                  minWidth: "50px",
                  maxHeight: "50px",
                  maxWidth: "50px"
                }}
              >
                <img
                  className="animate-lr"
                  src={message.profile.avatar}
                  alt="avatar"
                  height="55px"
                  width="55px"
                  style={{
                    marginRight: "4px",
                    // border: "1px solid white",
                    borderRadius: "999px",
                    objectFit: "cover"
                  }}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const getMessageString = () => {
  const mess =
    MESSAGES[
      Math.min(
        Math.max(0, +(Math.random() * MESSAGES.length).toFixed(0)),
        MESSAGES.length
      )
    ];
  return mess;
};

const getRamdonMessage = ({ isSticker }: { isSticker: boolean }) => {
  const userName =
    USERNAMES[
      Math.min(
        Math.max(0, +(Math.random() * USERNAMES.length).toFixed(0)),
        USERNAMES.length
      )
    ];
  return {
    id: "" + Math.random() + (Math.random() > 0.5 ? "-1" : "-0"),
    data: {
      message: !isSticker ? getMessageString() : undefined,
      profile: {
        avatar: `https://robohash.org/${userName}`,
        username: userName
      }
    }
  };
};

type IMessage = ReturnType<typeof getRamdonMessage>;
type P = keyof typeof LOGICS;

export default function App() {
  const [currLogic, setCurrLogic] = useState<P>(
    (Object.keys(LOGICS) as P[])[0]
  );
  const [chatPerSec, setChatPerSec] = useState(10);
  const [stickerRandomness, setStickerRandomness] = useState(0.5);
  const [isMessageStart, setMessageStart] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const timerRef = useRef<any[]>([]);

  useEffect(() => {
    while (timerRef.current.length) {
      clearTimeout(timerRef.current.shift());
    }
    if (!isMessageStart) return;

    const addm = () => {
      const newMsg = new Array(chatPerSec).fill(null);

      if (!newMsg.length) return;
      const eachDuration = Math.max(10, 2000 / newMsg.length);
      let i = 1;
      for (let _ of newMsg) {
        let timer = setTimeout(() => {
          setMessages((oldMessages) => {
            if (oldMessages.length > 75) {
              oldMessages = oldMessages.slice(oldMessages.length / 2);
            }
            return [
              ...oldMessages,
              getRamdonMessage({
                isSticker: Math.random() > stickerRandomness
              })
            ];
          });
        }, eachDuration * i);
        i += 1;
        timerRef.current.push(timer);
      }
    };

    let intervallRef = setInterval(addm, 2000);
    let aa = setTimeout(addm, 100);
    return () => {
      clearTimeout(aa);
      clearInterval(intervallRef);
    };
  }, [isMessageStart, chatPerSec, stickerRandomness]);

  useEffect(() => {
    setMessageStart(false);
  }, [currLogic]);
  const WRAPPER = LOGICS[currLogic] || ChatWrapper;
  const CONTAINER_INFO = messages.length ? (
    <WRAPPER chatPerSec={chatPerSec}>
      {messages.map(({ id: msgId, data }, id) => {
        return <MessageUI message={data} key={msgId + id} />;
      })}
    </WRAPPER>
  ) : (
    "No New Message"
  );
  return (
    <div className="App">
      <div
        style={{
          flex: 1,
          borderRight: "1px dashed black",
          height: "100%",
          width: "100%",
          maxWidth: "30%"
        }}
      >
        <div className="slide-menu">
          <div className="flex">
            Chat Speed /2sec
            <div className="flex-row">
              <div style={{ width: "40px" }}>{chatPerSec}</div>
              <input
                className="input-slider"
                type="range"
                min="5"
                max="55"
                step={chatPerSec > 20 ? "5" : "1"}
                value={chatPerSec}
                onChange={(e) => {
                  setChatPerSec(+e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex">
            Message Ratio
            <div className="flex-row">
              <div
                style={{
                  width: "40px"
                }}
              >
                {stickerRandomness}
              </div>
              <input
                className="input-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={stickerRandomness}
                onChange={(e) => {
                  setStickerRandomness(+e.target.value);
                }}
              />
            </div>
          </div>
          <div
            className="flex"
            style={{
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            Code Logic: <br />
            {currLogic}
            <div
              className="flex-row"
              style={{
                minWidth: "100%",
                flex: 1,
                display: "flex",
                flexWrap: "wrap",
                padding: "0 0 0 10px"
              }}
            >
              {(Object.keys(LOGICS) as P[]).map((item) => {
                return (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      width: "100%",
                      padding: "4px 0 4px 10px"
                    }}
                  >
                    <span
                      style={{
                        textAlign: "start",
                        // minWidth: "70%"
                        flex: 1
                      }}
                    >
                      {item}
                    </span>
                    <input
                      name="gg"
                      type="radio"
                      value="item"
                      defaultChecked={currLogic === item}
                      onClick={() => {
                        setCurrLogic(item);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <button
              onClick={() => {
                setMessageStart((x) => !x);
              }}
              style={{
                cursor: "pointer",
                minWidth: "90px",
                padding: "4px 12px"
              }}
            >
              {isMessageStart ? "STOP" : "START"}
            </button>
            <br />
            <button
              onClick={() => {
                setChatPerSec(5);
                setStickerRandomness(0.3);
                setMessageStart(false);
                setMessages([]);
              }}
              style={{
                cursor: "pointer",
                minWidth: "90px",
                padding: "4px 12px",
                marginTop: "10px"
              }}
            >
              RESET
            </button>
          </div>
          Total Messages: {messages.length}
          <h1>Hello CodeSandbox</h1>
        </div>
      </div>
      <div className="main-content">{CONTAINER_INFO}</div>
    </div>
  );
}
