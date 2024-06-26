const express = require('express');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { Group, User, Membership, GroupImage, Organizer, Venue } = require('../../db/models');

const { Sequelize, Op } = require('sequelize');

const venue = express.Router();


venue.put('/:venueId', [requireAuth], async (req, res, next) => {
    //Check to see if you have the correct role
    const { user } = req;
    const venueId = req.params.venueId;
    const findVenue = await Venue.findByPk(venueId);

    //Check to see if the venue exists
    if (!findVenue) {
        const err = new Error("Venue couldn't be found");
        err.status = 404;
        return next(err);
    }


    const findGroup = await Group.findOne({
        where: {
            id: findVenue.groupId
        }
    })


    if (!findGroup) {
        const err = new Error("Group couldn't be found");
        err.status = 404;
        return next(err);
    }

    const membershipStatus = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: findGroup.id
        }
    });

    //============================================
    if (membershipStatus) {
        if (membershipStatus.status !== 'co-host') {
            const err = new Error("Forbidden");
            err.status = 403;
            return next(err);
        }
    } else {
        if (findGroup.organizerId !== user.id) {
            const err = new Error("Forbidden");
            err.status = 403;
            return next(err);
        }

    }

    //============================================

    const { address, city, state, lat, lng } = req.body;

    try {
        await findVenue.update({
            address, city, state, lat, lng
        })
    } catch (err) {
        err.message = 'Bad Request';
        err.errors = err.errors
        err.status = 400;

        return next(err)
    }

    delete findVenue.dataValues.updatedAt;

    return res.json(findVenue);

});

















module.exports = venue;
