// import React from 'react';
// import { Link } from 'react-router-dom';
//
// const LandingPage = () => (
//   <div>
//     <h1>Welcome to BaseBuild</h1>
//     <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
//   </div>
// );

// client/src/pages/Landing.js
import React from 'react';
import { Button } from 'primereact/button';  // PrimeReact Button component
import { Card } from 'primereact/card';      // PrimeReact Card component
import { Link } from 'react-router-dom';
import hero from '../assets/images/hero.jpg';

const LandingPage = () => {
  return (
    <div>

      <div className="grid grid-nogutter surface-0 text-800">
        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section>
            <span className="block text-6xl font-bold mb-1">Create the screens</span>
            <div className="text-6xl text-primary font-bold mb-3">your visitors deserve to see</div>
            <p className="mt-0 mb-4 text-700 line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                                                            do eiusmod tempor incididunt ut labore et dolore magna
                                                            aliqua.</p>
            <Link to="/register" style={{textDecoration: 'none'}} data-cy="registration-button">
              <Button label="Sign Up" type="button" className="mr-3 p-button-raised"/>
            </Link>
            <Link to="/login" style={{textDecoration: 'none'}} data-cy="login-button">
              <Button label="Login" type="button" className="p-button-outlined"/>
            </Link>
          </section>
        </div>
        <div className="col-12 md:col-6 overflow-hidden">
          <img src={hero} alt="hero-1" className="md:ml-auto block md:h-full"
               style={{clipPath: 'polygon(8% 0, 100% 0%, 100% 100%, 0 100%)'}}/>
        </div>
      </div>


      <div className="surface-0 mt-8">
        <div className="text-900 font-bold text-6xl mb-4 text-center">Pricing Plans</div>
        <div className="text-700 text-xl mb-6 text-center line-height-3">Lorem ipsum dolor sit, amet consectetur
                                                                         adipisicing elit. Velit numquam eligendi quos.
        </div>

        <div className="grid">
          <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 h-full flex flex-column" style={{borderRadius: '6px'}}>
                <div className="text-900 font-medium text-xl mb-2">Basic</div>
                <div className="text-600">Plan description</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$9</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Arcu vitae elementum</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Dui faucibus in ornare</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Morbi tincidunt augue</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto"/>
                <Button label="Buy Now" className="p-3 w-full mt-auto"/>
              </div>
            </div>
          </div>

          <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 h-full flex flex-column" style={{borderRadius: '6px'}}>
                <div className="text-900 font-medium text-xl mb-2">Premium</div>
                <div className="text-600">Plan description</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$29</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Arcu vitae elementum</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Dui faucibus in ornare</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Morbi tincidunt augue</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Duis ultricies lacus sed</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <Button label="Buy Now" className="p-3 w-full"/>
              </div>
            </div>
          </div>

          <div className="col-12 lg:col-4">
            <div className="p-3 h-full">
              <div className="shadow-2 p-3 flex flex-column" style={{borderRadius: '6px'}}>
                <div className="text-900 font-medium text-xl mb-2">Enterprise</div>
                <div className="text-600">Plan description</div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <div className="flex align-items-center">
                  <span className="font-bold text-2xl text-900">$49</span>
                  <span className="ml-2 font-medium text-600">per month</span>
                </div>
                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <ul className="list-none p-0 m-0 flex-grow-1">
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Arcu vitae elementum</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Dui faucibus in ornare</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Morbi tincidunt augue</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Duis ultricies lacus sed</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Imperdiet proin</span>
                  </li>
                  <li className="flex align-items-center mb-3">
                    <i className="pi pi-check-circle text-green-500 mr-2"></i>
                    <span>Nisi scelerisque</span>
                  </li>
                </ul>
                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300"/>
                <Button label="Buy Now" className="p-3 w-full p-button-outlined"/>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="p-d-flex p-jc-center p-ai-center" style={{minHeight: '100vh'}}>
        <Card title="Welcome to BaseBuild" subTitle="Make data-driven decisions with ease" className="p-shadow-5">
          <p>
            BaseBuild is a platform that helps you manage experiments, make data-driven decisions, and achieve your
            business goals effectively.
          </p>
          <div className="p-d-flex p-ai-center p-flex-column">
            <Link to="/register">
              <Button label="Get Started" className="p-button-success p-mt-2"/>
            </Link>
            <Link to="/login">
              <Button label="Login" className="p-button-secondary p-mt-2"/>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
