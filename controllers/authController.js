const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const { validateUser } = require('../utils/validators');

const register = async (req, res) => {

  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validation
    const errors = validateUser(req.body);

// console.log(req.body);
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ status: 'Bad request', message: 'Registration unsuccessful' });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await User.addUser({ firstName, lastName, email, password: hashedPassword, phone });

 

    // Create organisation
    const orgName = `${firstName}'s Organisation`;

    const newOrg = await Organisation.addOrganisation({ name: orgName, description: '' });


  

    // Add user to organisation
  
   
      await Organisation.addUserToOrg(newUser.userid, newOrg.orgid);

  //  console.log(newUser.userid)
  //  console.log(process.env.JWT_SECRET)
 

    // Generate token
    const token = jwt.sign({ userId: newUser.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // const token = jwt.sign({ userId: newUser.userid }, process.env.JWT_SECRET);

 
    // console.log(token)

    res.status(201).json({
      status: 'success',
      message: 'Registration successful123',
      data: {
        accessToken: token,
        user: {
          userId: newUser.userid,
          firstName: newUser.firstname,
          lastName: newUser.lastname,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(422).json({ errors: [{ field: 'email or password', message: 'Email and password are required' }] });
    }

    // Find user
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ status: 'Bad request', message: 'Authentication failed' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'Bad request', message: 'Authentication failed' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

    

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userid,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login
};
