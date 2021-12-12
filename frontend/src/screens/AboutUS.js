import React from 'react'
// import { useDispatch, useSelector } from 'react-redux';
import {Link} from 'react-router-dom'
function about(){
    return(
         <div className='cont'>
            <div className='cont1'>
            <strong className='st1'>Why we started ?</strong>  
            <p>Most of the times we have seen that people are in search of individuals for selling their used books, it is difficult for them to find the buyer, also many students require books for a short period of time so they cannot afford new books instead they prefer using used books so that they can utilize and again sell it so earlier it was quite difficult for them to find the used books. 
            Our project aims to provide a platform for such users who want to sell or buy used books. This application will definitely benefit such section and also using used books saves paper so it is also beneficial for the environment keeping in mind the serious threats to the environment.</p>
            </div>
            <div className='cont1'>
            <strong className='st1'>How it works...</strong>  
            <p>Initially books from all genres uploaded by the sellers are visible on the home page of the website. Buyer can see the books for sale. For buyer to get access to seller details and book details, and for seller to upload the book, authorization is important, if not created an account then user must register, in the case having an account user must login to perform the above functionality. 
            Seller can decide the price of the book according to his/her convenience. For buyers convenience we have used Google Map location feature so as to make the product easily accessible. So buyer can easily track the seller on Google Maps. This 
location will be provided from the seller’s side while uploading the book. There is a chat functionality implemented to establish a communication between the seller and the buyer.  Once the book is sold seller can remove it from the website.</p>
            </div>
            <div className='cont2'>
            <div><strong className='st1'>Our Team</strong></div>
            <div className='subcont'>
                <div>
                <img src='/ArjunPandey.jpeg' alt='Arjun'></img>
                <p><strong>Arjun Pandey</strong><br></br>
                Team Lead</p>     
                </div>
                <div><img src='/Abhijeet.jpeg' alt='Abhijeet'></img>
                <p><strong>Abhijeet Raj</strong><br></br>
                Team Member</p>
                </div>
                <div><img src='./Anuj.jpeg' alt='Anuj'></img>
                <p><strong>Anuj Aglawe</strong><br></br>
                Team Member</p>
                </div>
            </div>  
            </div>

         </div>
    );
}




export default about;