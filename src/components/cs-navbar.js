/*
* Class for <cs-navbar> element
*/
class CustomNavbar extends HTMLElement {

  constructor() {
      super();

      this._linkEventHandlers = [];

      // Sets shadow root
      this._shadowRoot = this.attachShadow({ mode: "open" });

      // Adds main icon and list for it
      let mainIconList = document.createElement("ul");
      mainIconList.className = "custom-nav custom-nav-main-icon-list";
      this._shadowRoot.appendChild(mainIconList);


      // Adds list for links
      let navLinks = document.createElement("ul");
      navLinks.className = "custom-nav custom-nav-links";
      this._shadowRoot.appendChild(navLinks);

      // Adds list for the icons of the right corner
      let iconList = document.createElement("ul");
      iconList.className = "custom-nav custom-nav-icons-list stick-right-corner";
      this._shadowRoot.appendChild(iconList);

      // Adds trigram button(reponsive menu) and list for it
      let trigramList = document.createElement("ul");
      trigramList.className = "custom-nav custom-nav-trigram-list";
      let trigramListItem = document.createElement("li");
      trigramListItem.className = "custom-nav-item disable-hover";
      let trigramButton = document.createElement("button");
      trigramButton.addEventListener("click", this.menuButtonClicked);
      trigramButton.className = "custom-nav-trigram-button";
      trigramButton.innerHTML = "&#9776;";
      trigramListItem.appendChild(trigramButton);
      trigramList.appendChild(trigramListItem);
      this._shadowRoot.appendChild(trigramList);

      // Adds default styles
      this._style = document.createElement("style");
      this.initializeStyle(this._style);


  }



  /*
  * This is called when the element has been attached to DOM
  * It set an ID for the element if it doesn't exist and then attaches event handlers for nav links
  */
  connectedCallback() {
      if (this._id === undefined || this._id === null) {
          if (this.getAttribute("id")) this._id = this.getAttribute("id");
          else {
              let id = "juiaxasdiueia" + (Math.random() * Math.random() * Math.random() * Math.random()).toString(24).substring(3);
              this.setAttribute("id", id);
              this._id = id;
          }
          for (let navItem of this._shadowRoot.querySelector(".custom-nav-links").children) {
              navItem.children[0].setAttribute("onclick", "document.getElementById('" + this._id + "').linkClicked(this);")
          }
      }
  };




  /*
  * Properties and methods for menu
  */


  /*
  * Event called each time the menu toggle (trigram) is clicked
  * Provides basic features for opening and closing responsive menu 
  * Adds additionally transition style for height (animation) 
  */
  menuButtonClicked = () => {
      let element = this._shadowRoot.querySelector(".custom-nav-links");
      if (element.style.display === "none" || element.style.display == "") {
          this.style.transition = "height 1s ease-in-out";
          this.style.height = (element.children.length * 55) + "px";
          element.style.display = "flex";
      } else {
          this.style.height = "";
          element.style.display = "none";
      }
  };



  /*
  * Custom properties and methods
  */


  /*
  * Adds main icon
  * @param{string} iconClassName the Font Awesome icon's name (prefix included)
  * return void
  */
  addMainFAIcon = (iconClassName) => {
      let navItem = document.createElement("li");
      navItem.className = "custom-nav-item disable-hover";

      let slot = document.createElement("slot");
      slot.setAttribute("name", "mainIcon");
      navItem.appendChild(slot);
      this._shadowRoot.querySelectorAll(".custom-nav-main-icon-list")[0].appendChild(navItem);

      let icon = document.createElement("i");
      icon.setAttribute("slot", "mainIcon");
      icon.className = "custom-nav-icon " + iconClassName;
      this.appendChild(icon);
  };


  /*
  * Adds nav (menu) item | example -> addLink("Home", "https://localhost/home")
  * @param{string} linkName the name of the given link
  * @param{string} linkAddress the href of the given address
  * return void
  */
  addLink = (linkName, linkAddress) => {
      let navItem = document.createElement("li");
      navItem.className = "custom-nav-item";

      let link = document.createElement("a");
      link.innerHTML = linkName;
      link.setAttribute("name", linkName);
      link.className = "custom-nav-link";
      if (linkAddress) link.href = linkAddress;
      navItem.appendChild(link);

      this._shadowRoot.querySelectorAll(".custom-nav-links")[0].appendChild(navItem);
  };


  /*
  * Adds nav (menu) item | example -> addFAIcon("fas fab fa-linkedin")
  * @param{string} iconClassName the Font Awesome icon's name (prefix included)
  * @param{string} address optional parameter attaching link to icon
  * return void
  */
  addFAIcon = (iconClassName, address) => {
      let navItem = document.createElement("li");
      navItem.className = "custom-nav-item minimize-right-margin minimize-top-margin";

      let slot = document.createElement("slot");
      let slotName = "custom-icon" + this._shadowRoot.querySelectorAll(".custom-nav-icons-list")[0].children.length;
      slot.setAttribute("name", slotName);
      navItem.appendChild(slot);
      this._shadowRoot.querySelectorAll(".custom-nav-icons-list")[0].appendChild(navItem);

      let link = document.createElement("a");
      link.href = address || "#";
      if (!address && address != null && address.includes("http")) link.setAttribute("target", "_blank");
      link.className = "custom-nav-icon ";
      link.setAttribute("slot", slotName);

      let icon = document.createElement("i");
      icon.className = iconClassName;
      link.appendChild(icon);

      this.appendChild(link);
  };


  /*
  * Registers event handler for links
  * param{function} callback - the callback which will be called when link is clicked
  */
  registerEventHandlerForLinks = (callback) => {
      this._linkEventHandlers.push(callback);
  };



  /*
  * Each time when nav link is clicked this function is called
  * @param{HTMLElement} element - the element clicked
  */
  linkClicked = (element) => {
      for (let callback of this._linkEventHandlers) {
          try {
              callback(element);
          } catch (err) {
              console.log("Error occured while callin callbacks");
          }

      }
  };


  /*
  * Adds default styles
  */
  initializeStyle = (style) => {
      style.innerText = `
                          * {
                              box-sizing: border-box;
                              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
                          }
                          :host {
                              margin: 0px;
                              padding: 0px;
                              background-color: rgb(30, 139, 195);
                              width: 100%;
                              height: 70px;
                              display: flex;
                              flex-direction: row;
                              position: sticky;
                              top:0;
                              transition: height 2s ease-in-out;
                          }
                          .custom-nav {
                              list-style-type: none !important;
                              margin: 0px;
                              padding: 0px;
                              display: flex;
                              flex-direction: row;
                          }
                          ::slotted(.custom-nav-icon) {
                              margin: 0px;
                              padding: 0px;
                              margin-left: 10px;
                              margin-right: 10px;
                              color: white !important;
                              text-decoration: none !important;
                              font-weight: bold !important;
                              font-size: 35px !important;
                              line-height: 0px;
                          }
                          .custom-nav-icon {
                              margin: 0px;
                              padding: 0px;
                              margin-left: 10px;
                              margin-right: 10px;
                              color: white !important;
                              text-decoration: none !important;
                              font-weight: bold !important;
                              font-size: 35px !important;
                          }
                          .custom-nav-icon:hover {
                              cursor: pointer;
                          }
                          .custom-nav-item {
                              margin: 0px;
                              padding: 0px;
                              margin-right: 15px;
                              margin-bottom: 2px;
                              border-bottom: 2px rgba(51, 45, 45, 0) solid;
                              
                          }
                          .custom-nav-main-icon-list .custom-nav-item {
                              margin-right: 10px;
                              padding: 24px 5px 22px 10px;
                          }
                          .custom-nav-icons-list .custom-nav-item {
                              margin-right: 0px;
                              padding: 19px 5px 22px 5px;
                          }
                          
                          .custom-nav-item:hover  {
                              border-bottom: 2px white solid;
                          }
                          .custom-nav-links {
                              overflow: hidden;
                          }
                          .custom-nav-link {
                              display: block;
                              color: rgb(233, 227, 227);
                              text-decoration: none;
                              font-weight: bold;
                              font-size: 16px;
                              padding: 24px 5px 22px 5px;
                          }
                          .custom-nav-link:hover {
                              text-decoration: none;
                              color: white;
                          }
                          .disable-hover:hover {
                              border: 0px;
                          }
                          .custom-nav-trigram-button {
                              background-color: transparent;
                              color: white;
                              font-size: 1.4rem;
                              border-radius: 5px;
                              border-color: transparent;
                              outline: 0px;
                              cursor: pointer;
                              padding: 24px 5px 22px 10px;
                          }
                          .custom-nav-trigram-button:focus {
                              outline: none;
                          }
                          .custom-nav-trigram-list {
                              margin-left: auto;
                              display: none;
                          }
                          .stick-right-corner {
                              margin-left: auto;
                          }
                          .minimize-right-margin {
                              margin-right: 10px;
                          }
                          .minimize-top-padding {
                              padding-top: 10px;
                          }
                          @media screen and (min-width: 820px) {
                              :host {
                                  height: 70px !important;
                              }
                              .custom-nav-links{
                                  display: flex !important;
                                  flex-direction: row !important;
                              }
                              .custom-nav-links .custom-nav-item {
                                  margin-right: 10px;
                              }
                  
                          }
                          @media screen and (max-width: 50px) {
                              .custom-nav-item {
                                  margin-left: 10px;
                                  
                              }
                              .custom-nav-icons-list {
                                  display: none;
                              }
                              .custom-nav-links{
                                  display: none;
                                  flex-direction: column;
                              }
                              .custom-nav-link {
                                  padding: 10px 5px 5px 10px;
                              }
                              .custom-nav-link:nth-last-of-type(1) {
                                  padding: 24px 5px 5px 10px;
                              }
                              .custom-nav-trigram-list {
                                  display: flex;
                              }
                          }`;

      this._shadowRoot.appendChild(style);
  }


}

// Registers custom element as cs-navbar
customElements.define("cs-navbar", CustomNavbar);
