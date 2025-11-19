import React from  'react';

// components
import Couple from '../../components/couple';
import PreviewHero from '../../components/hero2';
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
import couple1 from '../../images/couple/img-4.jpg'
import couple2 from '../../images/couple/img-3.jpg'


const Homepage4 = () => {
    return(
       <div>
           <Navbar/>
           <PreviewHero preview={'items1'}/>
           <Saveday saveday={'s2'}/>
           <Couple couple={'s2'} coupleimg1={couple1} coupleimg2={couple2}/>
           <Welcome welcome={'s2'}/>
           <Story/>
           <People guest={'guest-style'}/>
           <Location/>
           <Gallery/>
           <Rsvp/>
           <Getting/>
           <Gift/>
           <Footer footer={'s2'}/>
       </div>
    )
}

export default Homepage4;