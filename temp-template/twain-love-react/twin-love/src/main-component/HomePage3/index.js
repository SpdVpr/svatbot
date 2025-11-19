import React from  'react';

// components
import Couple from '../../components/couple';
import BackgroundVideo from '../../components/hero3';
import Story from '../../components/story';
import Welcome from '../../components/welcome-area';
import People from '../../components/people';
import Location from '../../components/location';
import Gallery from '../../components/gallery';
import Rsvp from '../../components/rsvp';
import Getting from '../../components/getting';
import Gift from '../../components/gift';
import Navbar from '../../components/Navbar'
import Saveday from '../../components/countdown'
import Footer from '../../components/footer'
import couple1 from '../../images/couple/img-2.jpg'
import couple2 from '../../images/couple/img-1.jpg'

const Homepage3 = () => {
    return(
       <div>
           <Navbar/>
           <BackgroundVideo/>
           <Saveday/>
           <Couple coupleimg1={couple1} coupleimg2={couple2}/>
           <Welcome/>
           <Story/>
           <People/>
           <Location/>
           <Gallery/>
           <Rsvp/>
           <Getting/>
           <Gift/>
           <Footer />
       </div>
    )
}

export default Homepage3;