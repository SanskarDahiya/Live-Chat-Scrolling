import React, { useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "lodash-es";

const useCountElement = (elem: any[], duration = 500) => {
  const [diffCount, setDiffCount] = useState(0);
  const activeCountRef = useRef(0);
  activeCountRef.current = elem.length;
  useEffect(() => {
    let prev = activeCountRef.current;
    const t = setInterval(() => {
      setDiffCount(Math.abs(activeCountRef.current - prev));
      prev = activeCountRef.current;
    }, duration);

    return () => {
      clearInterval(t);
    };
  }, [duration]);

  return diffCount;
};
const ChatWrapper = ({ children }: any) => {
  const chatListRef = useRef<null | HTMLDivElement>(null);
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const isChatInView = useRef(true);
  const countDiff = useCountElement(children);
  // const isScrollInProgress = useRef(false);
  // const coolDownScrollToNewMessage = useRef(false); //500ms delay for scrollToNewMessage() to run, so that the chat container hide/unhide transition works
  // const ignoreFirstScrollToNewMessage = useRef(false); //used to ignore the first time when chat container is shown from hiding since coolDownScrollToNewMessage is not updated till then
  const [isRoomToScrollBottom, setIsRoomToScrollBottom] = useState(false);

  // const handleScrollButton = () => {
  //   //   if (!chatListRef.current) return;
  //   //   const { scrollTop, offsetHeight, scrollHeight } = chatListRef.current;
  //   //   console.log({
  //   //     diff: scrollTop - scrollHeight,
  //   //     scrollTop,
  //   //     offsetHeight,
  //   //     scrollHeight
  //   //   });
  //   //   // chatListRef.current.scrollTop = scrollHeight;
  //   //   // chatListRef.current.style.transition = "all 150ms ease";
  //   //   // chatListRef.current.style.scrollBehavior = "smooth";

  //   bottomRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "end",
  //     inline: "end"
  //   });
  // };

  useEffect(() => {
    // const bottomElement = bottomRef.current;
    // if (!bottomElement) return;
    const cb = () => {
      if (document.visibilityState === "visible") {
        // handleScrollButton();
        isChatInView.current = true;
      } else {
        isChatInView.current = false;
      }
    };

    cb();
    // const intersectionObserver = new IntersectionObserver((entries) => {
    //   let [entry] = entries;
    //   if (entry.isIntersecting) {
    //     console.log(`${entry.target.id} is visible`);
    //   }
    // });
    // // start observing
    // intersectionObserver.observe(bottomElement);

    document.addEventListener("visibilitychange", cb);
    return () => {
      // intersectionObserver.unobserve(bottomElement);
      // intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", cb);
      isChatInView.current = true;
    };
  }, []);

  const scrollToNewMessage = () => {
    if (!chatListRef.current) return;
    const {
      scrollTop,
      offsetHeight,
      scrollHeight,
      clientHeight
    } = chatListRef.current;
    const height__ = scrollHeight - offsetHeight; // this isn't perfect
    const offset__ = offsetHeight - clientHeight; // and does this fix it? seems to...
    const scrollMax = height__ + offset__;
    // console.log("scrollToNewMessage-1", {
    //   diff: scrollMax - scrollTop,
    //   countDiff,
    //   scrollMax,
    //   scrollTop,
    //   offsetHeight,
    //   scrollHeight
    // });
    chatListRef.current.scroll({
      top: scrollMax,
      left: 0,
      behavior: countDiff >= 5 ? "auto" : "smooth"
    });
    // if (scrollHeight - scrollTop > 500) {
    //   isScrollInProgress.current = false;
    // }
    // if (isScrollInProgress.current) return;
    // isScrollInProgress.current = true;
    // if (coolDownScrollToNewMessage.current) return;
    // // if (ignoreFirstScrollToNewMessage.current) {
    // //   ignoreFirstScrollToNewMessage.current = false;
    // //   return;
    // // }
    // handleScrollButton();
    // bottomRef.current?.scrollIntoView({
    //   behavior: messagePer500ms.current < 0 ? "auto" : "smooth",
    //   block: "end",
    //   inline: "end"
    // });
  };
  // const throttleHandleScroll = useMemo(() => throttle(handleScroll, 300), []);
  // useEffect(() => {
  //   const chatList = chatListRef.current;
  //   if (!chatList) return;

  //   const handleScroll = () => {
  //     if (!chatListRef.current) return;
  //     const { scrollTop, offsetHeight, scrollHeight } = chatListRef.current;
  //     console.log("{ scrollTop, offsetHeight, scrollHeight }", {
  //       scrollTop,
  //       offsetHeight,
  //       scrollHeight
  //     });
  //     const isOnBottom =
  //       Math.abs(scrollTop + offsetHeight - scrollHeight) >= 60;
  //     // setIsRoomChatScrolledToTop(isOnBottom);
  //   };
  //   const throttleHandleScroll = throttle(handleScroll, 300);

  //   //   function pointerMove() {
  //   //     const chatList = chatListRef.current;
  //   //     if (!chatList) return;
  //   chatList.addEventListener("scroll", throttleHandleScroll);
  //   //   }
  //   //   function pointerLeave() {
  //   //     const chatList = chatListRef.current;
  //   //     if (!chatList) return;
  //   //     chatList.removeEventListener("scroll", throttleHandleScroll);
  //   //   }
  //   //   chatList.addEventListener("pointerenter", pointerMove);
  //   //   chatList.addEventListener("pointerleave", pointerLeave);
  //   return () => {
  //     chatList.removeEventListener("scroll", throttleHandleScroll);
  //     //     chatList.removeEventListener("pointerenter", pointerMove);
  //     //     chatList.removeEventListener("pointerleave", pointerLeave);
  //   };
  // }, []);

  // useEffect(() => {
  //   coolDownScrollToNewMessage.current = true;
  //   const cooldownTimer = setTimeout(() => {
  //     coolDownScrollToNewMessage.current = false;
  //   }, 500);

  //   return () => {
  //     clearTimeout(cooldownTimer);
  //   };
  // }, []);

  useEffect(() => {
    if (isChatInView.current && !isRoomToScrollBottom) {
      scrollToNewMessage();
    }
  });
  return (
    <div
      className="parentScrollbar"
      ref={chatListRef}
      style={{
        // verticalAlign: "bottom",
        flex: 1,
        width: "100%",
        // display: "inline-flex",
        // flexDirection: "column",
        // justifyContent: "flex-end",
        position: "relative",
        maxHeight: "90vh",
        border: "1px solid white",
        minHeight: "20px"
      }}
    >
      {children}
      <div ref={bottomRef} />
      {isRoomToScrollBottom && (
        <button
          style={{
            position: "sticky",
            bottom: "10px",
            background: "red",
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
