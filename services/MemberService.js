const Member = require("../models/Member");
const ProjectSchema = require("../models/Project");
const SubscriptionService = require("../services/SubscriptionService");
const SubscriptionLogService = require("../services/SubscriptionLogService");

const CreateMember = async (member) => {
    return await Member.create(member);
}


const createEnterprise = async (memberId,Enterprise) => {
    return await Member.findByIdAndUpdate(memberId, Enterprise);
}

const createProject = async (memberId, Project) => {
    const member = await Member.findById(memberId)
    if (!member) {
        throw new Error('Member doesn t exist !')
    }
    if (!member?.companyName) {
        throw new Error('You must create an Entreprise !')
    }
    return await ProjectSchema.create(Project)
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

    
    const member = await getMemberById(memberId)
    if (member?.subStatus =="active"){
        return await RenewSubscription(member,subscription)
    }
    else{
        //Expire Date calculation
        const expiry_date = new Date();
        expiry_date.setDate(expiry_date.getDate() + subscription?.duration);

        await SubscriptionLogService.createSubscriptionLog({
            subscriptionId: subscription._id,
            member: memberId,
            credits: subscription.credits,
            totalCredits: subscription.credits + (member?.credits || 0),
            subscriptionExpireDate: expiry_date
        })
        return await Member.findByIdAndUpdate(memberId, {
            subscriptionId: subscription._id,
            subStatus: "active",
            expireDate: expiry_date,
            $inc: { 'credits': subscription.credits }
        })
    }
   
    }


const RenewSubscription = async (member, subscription) => {

    //Expire Date calculation
    const expiry_date = new Date(member.expireDate);
    expiry_date.setDate(expiry_date.getDate() + subscription?.duration);
    
    await SubscriptionLogService.createSubscriptionLog({
        subscriptionId: subscription._id,
        member: member?._id,
        credits: subscription.credits,
        totalCredits: subscription.credits + (member?.credits || 0),
        subscriptionExpireDate: expiry_date,
        type:'Renew'
    })

    return await Member.findByIdAndUpdate(member?._id, {
        subscriptionId: subscription._id,
        subStatus: "active",
        expireDate: expiry_date,
        $inc: { 'credits': subscription.credits }
    })
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

module.exports = { createProject,checkSubscriptionStatus, CreateMember, createEnterprise, getMemberById, memberByNameExists, getMemberByName, SubscribeMember, getMemberByUserId, checkMemberSubscription, checkSubscriptionStatus }