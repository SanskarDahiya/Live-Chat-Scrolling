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
const ChatWrapper = ({ children, chatPerSec }: any) => {
  const chatListRef = useRef<null | HTMLDivElement>(null);
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const isChatAutoScrollEnabled = useRef(true);
  const countDiffRef = useRef(0);
  countDiffRef.current = +(chatPerSec / 4).toFixed(0);
  // countDiffRef.current = useCountElement(children);
  const countDiff = countDiffRef.current;
  // const isScrollInProgress = useRef(false);
  const coolDownScrollToNewMessage = useRef(false); //500ms delay for scrollToNewMessage() to run, so that the chat container hide/unhide transition works
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
    let cool_down_timer: any;
    const cb = () => {
      coolDownScrollToNewMessage.current = false;
      cool_down_timer && clearTimeout(cool_down_timer);
      if (document.visibilityState === "visible") {
        scrollToNewMessage("smooth");
        setIsRoomToScrollBottom(false);
        coolDownScrollToNewMessage.current = true;
        cool_down_timer = setTimeout(() => {
          coolDownScrollToNewMessage.current = false;
        }, 500);
        isChatAutoScrollEnabled.current = true;
      } else {
        isChatAutoScrollEnabled.current = false;
      }
    };
    cb();
    document.addEventListener("visibilitychange", cb);
    return () => {
      coolDownScrollToNewMessage.current = false;
      cool_down_timer && clearTimeout(cool_down_timer);
      document.removeEventListener("visibilitychange", cb);
      isChatAutoScrollEnabled.current = true;
    };
  }, []);

  const scrollToNewMessage = (behavior?: ScrollBehavior) => {
    if (coolDownScrollToNewMessage.current) return;
    if (!chatListRef.current) return;
    const { scrollTop, offsetHeight, scrollHeight, clientHeight } =
      chatListRef.current;
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
      // behavior: "auto",
      behavior: behavior || (countDiff >= 5 ? "auto" : "smooth")
    });
    // if (scrollHeight - scrollTop > 500) {
    //   isScrollInProgress.current = false;
    // }
    // if (isScrollInProgress.current) return;
    // isScrollInProgress.current = true;

    // // if (ignoreFirstScrollToNewMessage.current) {
    // //   ignoreFirstScrollToNewMessage.current = false;
    // //   return;
    // // }
    // handleScrollButton();
    // bottomRef.current?.scrollIntoView({
    //   behavior: countDiff >= 5 ? "auto" : "smooth",
    //   block: "end",
    //   inline: "end",
    // });
  };
  // const throttleHandleScroll = useMemo(() => throttle(handleScroll, 300), []);
  useEffect(() => {
    const chatList = chatListRef.current;
    if (!chatList) return;
    let prevValue__: number | null = null;
    const handleScroll = () => {
      if (!chatListRef.current) return;

      const { scrollTop, offsetHeight, scrollHeight, clientHeight } =
        chatListRef.current;

      const height__ = scrollHeight - offsetHeight; // this isn't perfect
      const offset__ = offsetHeight - clientHeight; // and does this fix it? seems to...
      const scrollMax = height__ + offset__;

      prevValue__ = prevValue__ === null ? scrollTop : prevValue__;
      const prevValue = prevValue__;
      const currValue = scrollTop;
      prevValue__ = currValue;
      const IS_SCROLL_UP = currValue < prevValue; // - IS_SCROLL_DOWN

      console.log("{ scrollTop, offsetHeight, scrollHeight }", {
        countDiff: countDiffRef.current,
        cooldown: coolDownScrollToNewMessage.current,
        IS_SCROLL_UP,
        difff: Math.abs(currValue - prevValue),
        currValue,
        prevValue,
        scrollTop,
        scrollMax,
        offsetHeight,
        scrollHeight
      });
      if (coolDownScrollToNewMessage.current) return;
      if (IS_SCROLL_UP) {
        const IS_USER_SCROLLING_UP =
          Math.abs(scrollMax - currValue) > 1 &&
          Math.abs(currValue - prevValue) < 1000; // not scroll due to chat message lenght reduced
        if (IS_USER_SCROLLING_UP) {
          isChatAutoScrollEnabled.current = false;
          setIsRoomToScrollBottom(true);
        }
      } else {
        const IS_NEAR_TO_BOTTOM = Math.abs(scrollMax - currValue) <= 60;
        isChatAutoScrollEnabled.current = true;
        if (IS_NEAR_TO_BOTTOM) {
          setIsRoomToScrollBottom(false);
        }
      }

      // const isOnBottom =
      //   Math.abs(scrollTop + offsetHeight - scrollHeight) >= 60;

      // setIsRoomToScrollBottom(isOnBottom);
    };
    // const throttleHandleScroll = handleScroll;
    const throttleHandleScroll = throttle(handleScroll, 50);
    const pauseChatonClick = () => {
      isChatAutoScrollEnabled.current = false;
      setIsRoomToScrollBottom(true);
    };
    //   function pointerMove() {
    //     const chatList = chatListRef.current;
    //     if (!chatList) return;
    chatList.addEventListener("scroll", throttleHandleScroll);
    chatList.addEventListener("click", pauseChatonClick);
    chatList.addEventListener("touchstart", pauseChatonClick);
    //   }
    //   function pointerLeave() {
    //     const chatList = chatListRef.current;
    //     if (!chatList) return;
    //     chatList.removeEventListener("scroll", throttleHandleScroll);
    //   }
    //   chatList.addEventListener("pointerenter", pointerMove);
    //   chatList.addEventListener("pointerleave", pointerLeave);
    return () => {
      chatList.removeEventListener("touchstart", pauseChatonClick);
      chatList.removeEventListener("click", pauseChatonClick);
      chatList.removeEventListener("scroll", throttleHandleScroll);
      //     chatList.removeEventListener("pointerenter", pointerMove);
      //     chatList.removeEventListener("pointerleave", pointerLeave);
    };
  }, []);

  // useEffect(() => {
  //   coolDownScrollToNewMessage.current = true;
  //   const cooldownTimer = setTimeout(() => {
  //     coolDownScrollToNewMessage.current = false;
  //   }, 500);

  //   return () => {
  //     clearTimeout(cooldownTimer);
  //   };
  // }, []);
  const previousChild = useRef(null);

  useEffect(() => {
    if (!isRoomToScrollBottom) {
      previousChild.current = children;
    }
    if (isChatAutoScrollEnabled.current && !isRoomToScrollBottom) {
      scrollToNewMessage();
    }
  });
  return (
    <div
      className="parentScrollbar"
      ref={chatListRef}
      style={{
        flex: 1,
        width: "100%",
        position: "relative",
        maxHeight: "90vh",
        border: "1px solid white",
        minHeight: "20px"
      }}
    >
      {previousChild.current || children}
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
            setIsRoomToScrollBottom(false);
            scrollToNewMessage("smooth");
          }}
        >
          click to move
        </button>
      )}
    </div>
  );
};

export default ChatWrapper;
