import bcrypt from 'bcryptjs';


const users = [
    {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true,
    },
    {
        name: 'Amit ',
        email: 'amit@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
    },
    {
        name: 'Ankit User',
        email: 'ankit@gmail.com',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
    },
]
export default users;