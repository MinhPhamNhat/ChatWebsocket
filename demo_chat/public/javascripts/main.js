
    const socket = io();
   
    var userId;
    var currentChat;
    var typingTimer;
    var doneTypingInterval = 1000;
    
    $(document).ready(() => {
        // Lấy id người dùng trên database
        userId = $("#hidden-user-id").val();

    })

    socket.on('connect', () => {
        socket.emit("user-join", userId)

        socket.on('list-user', showUserList)
    })

    // Hàm hiện danh sách user 
    const showUserList = ({
        users,
        eventUser,
    }) => {
        $(".contacts li").remove()
        users.sort(value => value.active ? -1 : 1)
        users.forEach(u => {
                // Nếu người dùng trong user-list có id trên db trùng với userId được lấy ở trên thì bỏ qua không hiển thị trên list
                if (u.userId !== userId)
                    $(".contacts").append(createUserTag(u))
                else {
                    console.log(u.id, u.name)
                }
            })
            // Nếu người vừa online hay disconnect có id trên db trùng với userId được lấy ở trên thì không hiển thị thông báo,
            // nếu không thì hiển thị thông báo cho toàn server
        if (eventUser)
            if (eventUser.userId !== userId) {
                if (eventUser.action) {
                    $("#online-notification strong").text(eventUser.name)
                    $("#online-notification").show(300)
                    setTimeout(() => {
                        $("#online-notification").hide(300)
                    }, 2000)
                } else {
                    $("#offline-notification strong").text(eventUser.name)
                    $("#offline-notification").show(300)
                    setTimeout(() => {
                        $("#offline-notification").hide(300)
                    }, 2000)
                }
            }
    }
    
    // Hàm tạo user tag
    const createUserTag = (user) => `
        <li class="user-${user.userId} ${currentChat === user.userId?"active":""}">
            <div class="d-flex bd-highlight user_cont" data-id="${user.userId}" onclick=chatWith(this)>
                <div class="img_cont">
                    <div class="avatar rounded-circle"><b><img src="${user.picture}"></b></div>
                    <span class="online_icon ${user.active?"":"offline"}"></span>
                </div>
                <div class="user_info">
                    <span>${user.name}</span>
                    <p>${user.active?"Online":"Offline"}</p>
                </div>
            </div>
        </li>`

    // Bắt sự kiện đang tìm kiếm
    const searchingCatch = (e) => {
        var text = e.value
        socket.emit("searching", {
                text
            })
    }
    // Kết thúc sự kiện tìm kiếm

    // Bắt sự kiện người dùng nhấp vào một người dùng khác
    const chatWith = (e) => {
        // Lấy id người dùng được click
        var userIdClicked = e.dataset.id
        // Gán người dùng đang chat
        currentChat = userIdClicked
        
        // Emit lấy thông tin người dùng được click và lấy tin nhắn của cả hai
        socket.emit("get-into-chat", ({fromUser: userId, toUser: userIdClicked}))
        
        socket.on("get-into-chat", (data) => {
            var userClickedInfo = data.user
            var messages = data.messages

            if (userClickedInfo) {

                // Mở tab chat với người dùng đó nếu tìm thấy người dùng
                createChatTab(userClickedInfo)

                
                var msgCont = $(`.chat-${userClickedInfo._id}  .msg_card_body`)

                // Hiện tin nhắn trước đó giữa hai người dùng
                messages.forEach(msg => {
                    msgCont.append(createMessageTag(msg, msg.fromUser._id===userId))
                })
                
                // Scroll to bottom
                msgCont.animate({ scrollTop: msgCont[0].scrollHeight}, 1000);
            }
        })
    }
    
    // Hàm tạo tab chat với người dùng đó
    const createChatTab = (userInChat) => {
        // Xóa các người dùng đang được click active
        $('li[class*="active"]').removeClass("active")
        // Active người đang chat
        $(`.user-${userInChat._id}`).addClass("active")

        // Xóa tab chat để tạo mới
        $(".chat_room .card").remove()

        // Tạo tab chat
        var div = document.createElement('div')
        div.innerHTML =
            `
        <div class="card chat-${userInChat._id}" data-id ="${userInChat._id}">
            <div class="card-header msg_head">
                <div class="d-flex bd-highlight">
                    <div class="img_cont">
                        <div class="avatar rounded-circle"><b><img src="${userInChat.picture}"></b></div>
                        <span class="online_icon ${!userInChat.active?"offline":""}"></span>
                    </div>
                    <div class="user_info">
                        <span>${userInChat.name}</span>
                    </div>
                    <div class="video_cam">
                        <span><i class="fas fa-phone"></i></span>
                        <span><i class="fas fa-video"></i></span>
                    </div>
                </div>
                <span id="action_menu_btn"><i class="fas fa-ellipsis-v"></i></span>
                <div class="action_menu">
                    <ul>
                        <li><i class="fas fa-user-circle"></i> View profile</li>
                        <li><i class="fas fa-users"></i> Add to close friends</li>
                        <li><i class="fas fa-plus"></i> Add to group</li>
                        <li><i class="fas fa-ban"></i> Block</li>
                    </ul>
                </div>
            </div>
            <div class="card-body msg_card_body">
            </div>
            <div class="card-footer">
                <p class="typing-msg"><strong></strong> đang gõ ... </p>
                <div id="form" class="input-group" action="">
                    <input id="input"  onkeyup="sendChat(event) ; typingCatch(this)" onkeydown=typingStopCatch(this) data-id="${userInChat._id}" data-name="${userInChat.name}" class="form-control type_msg" autocomplete="off" placeholder="Type your message..." />
                    <div class="input-group-append">
                        <button class="input-group-text send_btn"><i class="fas fa-location-arrow"></i></button>
                    </div>
                </div>

            </div>

        </div>
    `
        document.querySelector('.chat_room').appendChild(div)
    }
    // Kết thúc bắt sự kiện người dùng nhấp vào một người dùng khác
    

    // Bắt sự kiện người dùng đang gõ
    const typingCatch = (e) => {
        var userChatId = e.dataset.id
        var name = e.dataset.name
        socket.emit("typing", { userSendChat: userId, userChatId, name })
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => { socket.emit("typing-done",  {  userSendChat: userId, userChatId, name }) }, doneTypingInterval);
    }

    const typingStopCatch = (e) => {
        clearTimeout(typingTimer);
    }

    socket.on("typing", (data) => {
        console.log(data)
        $(`.chat-${data.userSendChat} .typing-msg strong`).text(data.name)
        $(`.chat-${data.userSendChat} .typing-msg`).show()
    })

    socket.on("typing-done", (data) => {
        $(`.chat-${data.userSendChat} .typing-msg strong`).text('')
        $(`.chat-${data.userSendChat} .typing-msg `).hide()
    })
    // Kết thúc bắt sự kiện người dùng đang gõ

    // Bắt sự kiện người dùng nhấn enter thì emit tin nhắn
    const sendChat = (e) =>{
        var keycode = e.which || e.keyCode;
        if (keycode === 13){
            var userChatId = e.target.dataset.id
            var message = e.target.value
            if (message){
                socket.emit('send-message', {from: userId, message, to:userChatId})
                e.target.value
            }
        }
    }

    socket.on("send-message", (data)=>{
        createMessage(data)
    })
    // Kết thúc bắt sự kiện gửi tin nhắn


    // Hàm tạo tin nhắn
    const createMessage = (message) => {
        var isSender = message.fromUser.userId===userId
        console.log(message)
        if (isSender){
            var msgCont = $(`.chat-${message.toUser.userId} .msg_card_body `)
        }else{
            var msgCont = $(`.chat-${message.fromUser.userId} .msg_card_body `)
        }
        msgCont.append(createMessageTag(message, isSender))
        msgCont.animate({ scrollTop: msgCont[0].scrollHeight}, 1000);
    }

    // Hàm tạo element tin nhắn
    const createMessageTag = (message, isSender)=>{
        if (isSender){
            return `
            <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                    ${message.message}
                    <span class="msg_time_send">${formatTime(message.time)}</span>
                </div>
                <div class="img_cont_msg">
                    <img src=" ${message.fromUser.picture}" class="rounded-circle user_img_msg">
                </div>
            </div>
            `
        }else{
            return `
            <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                    <img src="${message.fromUser.picture}" class="rounded-circle user_img_msg">
                </div>
                <div class="msg_cotainer">
                    ${message.message}
                    <span class="msg_time">${formatTime(message.time)}</span>
                </div>
            </div>
            `
        }
    }


    // Hàm format thời gian
    const formatTime = (time) => {
        var time = new Date(time)
        var hours = time.getHours()/10>=1?time.getHours():"0"+time.getHours()
        var minutes = time.getMinutes()/10>=1?time.getMinutes():"0"+time.getMinutes()
        return `${hours}:${minutes}`
    }

    
