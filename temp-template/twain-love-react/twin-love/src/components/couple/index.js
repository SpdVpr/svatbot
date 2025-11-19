import React from 'react'
import Sectiontitle from '../section-title'
import './style.css'

const Couple = (props) => {
    return(
        <div id="couple" className={`about-wrap ${props.couple}`}>
            <div className="couple-area section-padding">
                <Sectiontitle section={'Happy Cuple'}/>
                <div className="container">
                    <div className="couple-wrap">
                        <div className="row">
                            <div className="col-lg-6 col-md-6 col-sm-12 couple-single">
                                <div className="couple-wrap couple-wrap-2">
                                    <div className="couple-img">
                                        <img src={props.coupleimg1} alt="thumb"/>
                                    </div>
                                    <div className="couple-text">
                                        <div className="couple-content">
                                            <h3>Aliza Elizabeth</h3>
                                            <p>Hi I am Nancy Elizabeth. I am going to introduce myself.I am a professional graphic designer professional graphic designer going to introduce myself.I am going to introduce myself.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12 couple-single">
                                <div className="couple-wrap couple-wrap-3">
                                    <div className="couple-img couple-img-2">
                                        <img src={props.coupleimg2} alt="thumb"/>
                                    </div>
                                    <div className="couple-text">
                                        <div className="couple-content">
                                            <h3>David Wiliam</h3>
                                            <p>Hi I am Nancy Elizabeth. I am going to introduce myself.I am a professional graphic designer professional graphic designer going to introduce myself.I am going to introduce myself.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
             
        </div>
        
    )
}

export default Couple;