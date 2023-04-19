import React, { useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "lodash-es";

const ChatWrapper = ({ children }: any) => {
  const chatListRef = useRef<null | HTMLDivElement>(null);
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const isChatInView = useRef(true);
  const coolDownScrollToNewMessage = useRef(false); //500ms delay for scrollToNewMessage() to run, so that the chat container hide/unhide transition works
  const ignoreFirstScrollToNewMessage = useRef(false); //used to ignore the first time when chat container is shown from hiding since coolDownScrollToNewMessage is not updated till then
  const [isRoomChatScrolledToTop, setIsRoomChatScrolledToTop] = useState(false);

  const handleScroll = () => {
    if (!chatListRef.current) return;
    const { scrollTop, offsetHeight, scrollHeight } = chatListRef.current;
    const isOnBottom = Math.abs(scrollTop + offsetHeight - scrollHeight) >= 60;
    setIsRoomChatScrolledToTop(isOnBottom);
  };
  useEffect(() => {
    const cb = () => {
      if (document.visibilityState == "visible") {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "end"
        });
        isChatInView.current = true;
      } else {
        isChatInView.current = false;
      }
    };

    document.addEventListener("visibilitychange", cb);
    return () => {
      document.removeEventListener("visibilitychange", cb);
      isChatInView.current = true;
    };
  }, []);

  const scrollToNewMessage = () => {
    if (coolDownScrollToNewMessage.current) return;
    if (ignoreFirstScrollToNewMessage.current) {
      ignoreFirstScrollToNewMessage.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "end"
    });
  };
  const throttleHandleScroll = useMemo(() => throttle(handleScroll, 300), []);
  useEffect(() => {
    const chatList = chatListRef.current;
    if (!chatList) return;
    function pointerMove() {
      const chatList = chatListRef.current;
      if (!chatList) return;
      chatList.addEventListener("scroll", throttleHandleScroll);
    }
    function pointerLeave() {
      const chatList = chatListRef.current;
      if (!chatList) return;
      chatList.removeEventListener("scroll", throttleHandleScroll);
    }
    chatList.addEventListener("pointerenter", pointerMove);
    chatList.addEventListener("pointerleave", pointerLeave);
    return () => {
      chatList.removeEventListener("pointerenter", pointerMove);
      chatList.removeEventListener("pointerleave", pointerLeave);
    };
  }, [throttleHandleScroll]);

  useEffect(() => {
    coolDownScrollToNewMessage.current = true;
    const cooldownTimer = setTimeout(() => {
      coolDownScrollToNewMessage.current = false;
    }, 500);

    return () => {
      clearTimeout(cooldownTimer);
    };
  }, []);

  useEffect(() => {
    if (isChatInView.current && !isRoomChatScrolledToTop) {
      scrollToNewMessage();
    }
  });
  return (
    <div
      className="parentScrollbar"
      ref={chatListRef}
      style={{
        position: "relative",
        overflow: "scroll",
        maxHeight: "90vh",
        border: "1px solid white",
        minHeight: "20px"
      }}
    >
      {children}
      <div ref={bottomRef} />
      {isRoomChatScrolledToTop && (
        <button
          style={{
            position: "sticky",
            bottom: "10px",
            background: "blue",
            padding: "10px 18px",
            margin: "0 auto",
            left: "30%",
            borderRadius: "20px"
          }}
          onClick={() => {
            scrollToNewMessage();
          }}
        >
          click to move
        </button>
      )}
    </div>
  );
};

export default ChatWrapper;
