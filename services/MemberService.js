const Member = require("../models/Member");
const SubscriptionService = require("../services/SubscriptionService");

const CreateMember = async (member) => {
    return await Member.create(member);
}

const getMemberById = async (id) => {
    return await Member.findById(id);
}
const getMemberByUserId = async (userId) => {
    return await Member.findOne({ owner: userId });
}

const getMemberByName= async (name) => {
    return await Member.find({name:name})
}


const memberByNameExists = async (name) => {
    return await Member.exists({ name: name })
}

const SubscribeMember = async (memberId,subid) => {
    const subscription = await SubscriptionService.getSubscriptionById(subid)
    if (!subscription){
        throw new Error('Subscription doesn t exist !')
    }


    //Payement Logic ...(Stripe ...)

    //Expire Date calculation
    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + subscription?.duration);
    const member = await getMemberById(memberId)
    if (member?.subStatus =="active"){
        throw new Error('Your Subscription is still active !')

    }
    return await Member.findByIdAndUpdate(memberId,{
            subscriptionId: subscription._id,
            subStatus:"active",
            expireDate: expiry_date,
            $inc: { 'credits': subscription.credits }})
    
    }



const checkSubscriptionStatus = async () => {
    try {
        const current_date = new Date();

        const activeSubscribers = await Member.find({ subStatus: 'active' });

        for (const Member of activeSubscribers) {
            if (Member.expireDate < current_date) {
                await Member.findByIdAndUpdate(Member._id, {
                    subscriptionId: null,
                    expireDate: null,
                    subStatus: 'notActive'

                });
            }
        }
    } catch (err) {
        console.error('Error checking subscription status:', err);
    }
};


const checkMemberSubscription = async (memberId) => {
    try {
        const current_date = new Date();

        const member = await Member.findById(memberId);
        
        if (member && member?.expireDate < current_date) {
            await Member.findByIdAndUpdate(memberId, {
                subscriptionId: null,
                expireDate: null,
                subStatus: 'notActive'
            
            });
            }
        
    } catch (err) {
        console.error('Error checking subscription status:');
    }
};

module.exports = { checkSubscriptionStatus,CreateMember, getMemberById, memberByNameExists, getMemberByName, SubscribeMember, getMemberByUserId, checkMemberSubscription, checkSubscriptionStatus }