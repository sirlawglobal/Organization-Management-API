const Organisation = require('../models/Organisation');
const User = require('../models/User');

const createOrganisation = async (req, res) => {

  
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(422).json({ errors: [{ field: 'name', message: 'Name is required' }] });
    }

    const newOrg = await Organisation.addOrganisation({ name, description });

    // console.log("new org:" + newOrg.orgid )
    // console.log("new org:" + req.user.userid )

    await Organisation.addUserToOrg(req.user.userId, newOrg.orgid);

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: newOrg,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const getUserOrganisations = async (req, res) => {

  console.log("this is from orgcontroller:" + req.user[0]);

  try {
    const userId = req.user.userId;

    // console.log(req.user)

    const orgs = await Organisation.findOrgsByUserId(userId);
    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations: orgs },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const getOrganisationById = async (req, res) => {
  try {
    const { orgId } = req.params;
    const org = await Organisation.findOrgById(orgId);
    if (!org) {
      return res.status(404).json({ status: 'error', message: 'Organisation not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Organisation retrieved successfully',
      data: org,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const addUserToOrganisation = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId } = req.body;
    const org = await Organisation.findOrgById(orgId);
    const user = await User.findUserById(userId);

    if (!org) {
      return res.status(404).json({ status: 'error', message: 'Organisation not found' });
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await Organisation.addUserToOrg(userId, orgId);
    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findUserById(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = {
  createOrganisation,
  getUserOrganisations,
  getOrganisationById,
  addUserToOrganisation,
  getUserById
};
