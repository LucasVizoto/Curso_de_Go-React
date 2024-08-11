import { useParams } from "react-router-dom";
import { Message } from "./message";
import { getRoomMessages } from "../http/get-room-messages";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMessageWebsockets } from "../hooks/use-messages-websockets";

export function Messages(){
    const{roomId} = useParams()

    if(!roomId){
        throw new Error("Messages components must be used within room page")
    }

    // const {messages} = use(getRoomMessages({roomId}))

    // console.log(messages)
    const { data } = useSuspenseQuery({
        queryKey: ['messages', roomId],
        queryFn: () => getRoomMessages({roomId}),
    })

    useMessageWebsockets({roomId})
    //parte de atualização em tempo real do programa

    const sortedMessages = data.messages.sort((a,b)=>{
        return b.amountOfReactions - a.amountOfReactions
    })

    return(
        <ol className="list-decimal list-inside px-3 space-y-8">
            {sortedMessages.map(message => {
                return(
                    <Message
                    id={message.id}
                    key={message.id}
                    text={message.text}
                    amountOfReactions={message.amountOfReactions}
                    answered={message.answered}
                    />
                )
            })}

        </ol>
    )
}