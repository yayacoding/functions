const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Responses = require('../common/API_Responses');
const WebSocket = require('../common/websocketMessage');
const connectToDatabase = require('../../../config/db');
const notification = require('../../notificationHandler');
const constant = require('../../../config/constant');
let connectedUserMap = new Map();
const {verifyToken } = require('../../../config/helper');

module.exports.handler = async event => {
    // console.log('event chat conversation message', event);

    if(event.requestContext){
                const { Conversation, User } = await connectToDatabase();
                const { connectionId, domainName, stage } = event.requestContext;

        try {

                 const routeKey = event.requestContext.routeKey;

            let body = {}
            try {
                if (event.body) {
                    body = JSON.parse(event.body)
                }
            } catch (e) { }

            switch (routeKey) {
                case '$connect':
                    console.log("connect...")
                    await setConnectionId(connectionId)
                    break;

                case '$disconnect':
                    console.log("disconnect...")
                    await deleteConnectionId(connectionId);
                    break;

                case 'checkUser':
                    console.log("checkUser...")
                    let userDetails = await getUserDetails(connectionId);
                    // console.log("🚀 ~ file: chatConversation.js ~ line 39 ~ userDetails", userDetails)

                    if (userDetails) {

                        userDetails.userId = body.userId

                        userDetails.meetId = body.meetId

                        userDetails.connectionId = connectionId
                    }

                    body.message = 'Check User is connected'

                    await WebSocket.send(domainName, stage, connectionId, body);

                    break;

                case 'sendPrivateMessage':
                    const socketData = await getConnectionId(body.otherUserId, body.meetId);
                    // console.log("🚀 ~ file: chatConversation.js ~ line 58 ~ socketData", socketData)

                    const data = {
                        userId: body.userId,
                        otherUserId: body.otherUserId,
                        meetId: body.meetId,
                        message: JSON.parse(event.body).message
                    };
                    // console.log("🚀 ~ file: chatConversation.js ~ line 66 ~ data", data)
                    await Conversation.create(data);

                    if (
                        socketData &&
                        socketData != undefined
                    ) {

                        for (var v of socketData) {
                            if (v.hasOwnProperty('meetId')) {
                                if (v.userId == body.otherUserId && v.meetId == body.meetId) {
                                    await WebSocket.send(domainName, stage, v.connectionId, body
                                    );
                                }
                            }
                        }

                        await Conversation.update({ isRead: true }, { where: { meetId: body.meetId, otherUserId: body.userId, isRead: false } });

                    }

                    await notification.sendNotification(
                        {
                            title: constant.NOTIFICATION[48].title,
                            body: JSON.parse(event.body).message,
                            notificationType: constant.NOTIFICATION[48].notificationType,
                            userNotificationType: constant.USER_NOTIFICATION_TYPE.SYSTEM,
                            notificationSubType: constant.NOTIFICATION_SUB_TYPE.MEET,
                            meetId: body.meetId
                        },
                        {
                            userId: body.otherUserId,
                            userToken: null,
                        },
                        {
                            notificationType: constant.NOTIFICATION[48].id.toString(),
                            meetId: body.meetId.toString(),
                            otherUserId: body.otherUserId.toString(),
                        },
                    )

                    await WebSocket.send(domainName, stage, connectionId, body);

                    console.log('sent message');

                    break;

                case 'readMessage':

                    await Conversation.update({ isRead: true }, { where: { meetId: body.meetId, otherUserId: body.userId, isRead: false } });

                    body.message = 'Message has been read.'

                    await WebSocket.send(domainName, stage, connectionId, body);
                    break;

                default:
                // code
            }

            return Responses._200({ message: 'got a message' });
        } catch (error) {
            // console.log(" ~ file: chatConversation.js ~ line 111 ~ error", error)
            return Responses._400({ message: 'message could not be received' });
        }
    }else{
            return Responses._400({ message: 'requestContext not provided' });
    }
};

module.exports.chatHistory = async (event) => {
    try {
        let whereClauseUser = {};
        const validateToken=await verifyToken(event)
        if(validateToken){
        return {
            statusCode: validateToken.statusCode,
            body: JSON.stringify({ message: validateToken.message }),
            headers: { 'Content-Type': 'JSON/application', 'Access-Control-Allow-Origin': '*' }
        }
        }else{
            const userData = await jwt.decode(event.headers.Authorization);
            if ('identities' in userData && userData.identities) {
                whereClauseUser.socialId = { [Op.eq]: userData.identities[0].userId };
            }
            else if (userData.phone_number) {
                if (userData.phone_number.slice(0, 1) == '+') {
                    whereClauseUser.countryCode = { [Op.eq]: userData.phone_number.substring(0, 3) };
                    whereClauseUser.phone = { [Op.eq]: userData.phone_number.substring(3) };
                }
                else if (userData.phone_number.slice(0, 1) == '0') {
                    whereClauseUser.countryCode = { [Op.eq]: userData.phone_number.substring(0, 4) };
                    whereClauseUser.phone = { [Op.eq]: userData.phone_number.substring(4) };
                }
            }
            whereClauseUser.status = { [Op.ne]: constant.STATUS.DELETED }
        }
        const { Conversation, User } = await connectToDatabase();

        const userDataDb = await User.findAll({ where: whereClauseUser });
        if (userDataDb.length < 1)
            return { statusCode: 404, body: JSON.stringify({ message: 'Invalid user!' }) };
        if (userDataDb[0].status === constant.STATUS.BLOCKED)
            return { statusCode: 401, body: JSON.stringify({ code: 601, message: 'Your account has been blocked by admin!' }) };

        if (!event.queryStringParameters || !event.queryStringParameters.meetId)
            return { statusCode: 400, body: JSON.stringify({ message: "meetId required" }) }

        const userId = userDataDb[0].id;

        let conversationData = await Conversation.findAll({
            where: {
                meetId: event.queryStringParameters.meetId,
                [Op.and]: [
                    {
                        [Op.or]: [
                            { userId: userId },
                            { otherUserId: userId }
                        ]
                    }
                ]
            }
        });
        if (conversationData.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ data: [] }) };
        } else {
            
            await Conversation.update({ isRead: true }, { where: { meetId: event.queryStringParameters.meetId, otherUserId: userId, isRead: false } });
            
            return { statusCode: 200, body: JSON.stringify({ data: conversationData }) };
        }

    } catch (error) {
        // console.log("Error while fetching conversationData", error);
        return error;
    }
};

const getConnectionId = (userId, meetId) => {
    var object = connectedUserMap.values();
    // console.log('get Socket ID Object =====>', object);
    return object;
}
const setConnectionId = async (ID) => {
    let result = await connectedUserMap.set(ID, { status: 'online', connectionId: ID });

    // console.log("🚀 ~ file: chatConversation.js line 207 ~ setConnectionId ~ result", '+++++++++++++++', connectedUserMap)

    return result
}
const getUserDetails = async (ID) => {

    // console.log("🚀 ~ file: chatConversation.js ~ line 213 ~ getUserDetails ~ result", '+++++++++++++++', connectedUserMap)
    return await connectedUserMap.get(ID);
}
const deleteConnectionId = async (ID) => {
    let disconnectData = await connectedUserMap.delete(ID);

    // console.log("🚀 ~ file: chatConversation.js ~ line 219 ~ setConndeleteConnectionIdectionId ~ result", '+++++++++++++++', connectedUserMap)

    return disconnectData
}
