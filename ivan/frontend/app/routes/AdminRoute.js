// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import axios from 'axios';

// const AdminRoute = ({ children }) => {
//     // const isAuthenticated = Cookies.get('token');
//     // const userRoles = Cookies.get('userRole') || '';
//     // const isAdmin = isAuthenticated && userRoles.split(',').includes('admin');

//     // console.log('AdminRoute check - Is Authenticated:', isAuthenticated, 'Is Admin:', isAdmin); // Log checks
    
//     // return isAdmin ? children : <Navigate to="/home" />;
//     const [isAdmin, setIsAdmin] = useState(false)

//     useEffect(()=> {
//         try {
//           axios.post('http://localhost:8000/checkGroup', {
//                 user_group: 'admin'
//           }).then((response)=> {
//             console.log(response)
//             setIsAdmin(true);
//           })
//           .catch((error) => console.log(error))
//         //   if (response) {
//         //     setIsAdmin(true);
//         //   }
//         } catch (error) {
//           console.log(error.message);
//         }
//       })
//       return <>{isAdmin ? children : <></>}</>
// };

// export default AdminRoute;


