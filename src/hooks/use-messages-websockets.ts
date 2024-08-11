import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { GetRoomMessagesResponse } from "../http/get-room-messages"

interface UseMessagesWebSocketsParams{
    roomId: string
}

// discriminated union, usado em linguagens tipadas para representar multiplos tipos diferentes
// onde cada variante é identificada (ou "discriminada") por um rótulo ou "tag". Esse rótulo torna 
// possível diferenciar qual variante do tipo está em uso em um dado momento.
type WebhookMessage = 
    |{kind: "message_created"; value:{id:string, message: string}}
    |{kind: "message_answered"; value:{id:string}}
    |{kind: "message_reaction_increased"; value:{id:string, count: number}}
    |{kind: "message_reaction_decreased"; value:{id:string, count: number}}
    
export function useMessageWebsockets({
    roomId,
}: UseMessagesWebSocketsParams){
    const queryClient = useQueryClient()

    //executa uma função quando uma variavel se altera
    //use effect é usado pois o componente pode ser chamado diversas vezes
    useEffect(()=> {
        const ws= new WebSocket(`ws://localhost:8080/subscribe/${roomId}`)
    
        ws.onopen = () =>{
            console.log("WebSocket connected!")
        }
        ws.onclose = () =>{
            console.log("WebSocket conection closed!")
        }

        ws.onmessage = (event) => {
            const data: WebhookMessage =  JSON.parse(event.data)
            // // console.log(message)        
            // {
            //     kind: 'message_created' | 'message_answered' | 'message_reaction_increased'|'message_reaction_decreased', 
            //     value: any,
            // } parte substituida pelo WebhookMessage
        
            switch (data.kind){
                case 'message_created':
                    // setQueryData, permite atualizar os dados de uma requisição já realizada anteriormente    
                    //requisição não é refeita, mas atualizada
                    queryClient.setQueryData<GetRoomMessagesResponse>(['messages', roomId], state =>{
                        // console.log(state)
                        // dentro do state eu tenho a lista anterior da criação de uma nova mensagem
                        
                        
                        return{
                            messages: [
                                ...(state?.messages ?? []), //se eu tiver o state.messages, faço o spread nele, senão faço num array vazio
                                {
                                    id: data.value.id,
                                    text: data.value.message,
                                    amountOfReactions: 0,
                                    answered: false,
                                }
                            ],
                        }
                    })
                
                    break
                case 'message_answered':
                                        // setQueryData, permite atualizar os dados de uma requisição já realizada anteriormente    
                    //requisição não é refeita, mas atualizada
                    queryClient.setQueryData<GetRoomMessagesResponse>(['messages', roomId], state =>{
                        // console.log(state)
                        // dentro do state eu tenho a lista anterior da criação de uma nova mensagem
                        if (!state){
                            return undefined
                        }
                        
                        return{
                            messages: state.messages.map(item =>{
                                if(item.id == data.value.id){
                                    return{...item, answered: true}
                                }
                                return item //else
                            }),
                        }
                    })
                
                    break
                case 'message_reaction_increased': //colocar sem o break assim, indica que os dois cases fazem a mesma coisa
                case 'message_reaction_decreased':
                    // setQueryData, permite atualizar os dados de uma requisição já realizada anteriormente    
                    //requisição não é refeita, mas atualizada
                    queryClient.setQueryData<GetRoomMessagesResponse>(['messages', roomId], state =>{
                    // console.log(state)
                    // dentro do state eu tenho a lista anterior da criação de uma nova mensagem
                    if (!state){
                        return undefined
                    }
                    
                    return{
                        messages: state.messages.map(item =>{
                            if(item.id == data.value.id){
                                return{...item, amountOfReactions: data.value.count}
                            }
                            return item //else
                        }),
                    }
                    })

                    break
                }
        }

        return () =>{
            ws.close()
            // cleanup function uma função que abre e fecha
        }
    },[roomId, queryClient])
    // ou seja, só vai conectar no websocket quando o roomId mudar
    // array de dependencias
}