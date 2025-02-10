const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: String,
    website: String,
    address: String,
    country: String,
    cityState: String,
    region: String,
    image: String,
    displayName: String,
    googleId: String,
    linkedinId: String,
    facebookId: String,
    instagramId: String,
    twitterId : String,
    youtubeId: String,
    email: {
        type: String,
        unique: true,
        lowercase: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'partner', 'investor', 'member' , 'Member' , 'associate']
    },
    password: String,
    dateCreated: { type: Date, default: Date.now },
    lastLogin: Date,
    status:
    {
        type: String,
        enum: ['accepted', 'pending', 'rejected', 'notVerified', 'verified'],
        default: 'notVerified'
    },
    language: String,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletionDate: {
    type: Date,
    }, 
    subscription: {
        type: mongoose.Types.ObjectId,
        ref: "Subscription",
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
} ,
{
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
});


UserSchema.index({ email: 1 });

// Middleware pour le nettoyage de l'email
UserSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

UserSchema.pre('findOneAndUpdate', function(next) {
    if (this._update.email) {
        this._update.email = this._update.email.toLowerCase().trim();
    }
    next();
});

// Virtual pour le nom complet
UserSchema.virtual('fullName').get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

UserSchema.statics.findActiveMembersByRole = function(role) {
    return this.find({ 
        role, 
        isDeleted: false,
        status: 'verified'
    });
};

const User = mongoose.model("User", UserSchema)
module.exports = User