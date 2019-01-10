// Initializing facebook sdk
window.fbAsyncInit = function() {
  FB.init({
    appId: "{your-api-key}",
    cookie: true,
    xfbml: true,
    version: "v3.2"
  });

  //   FB function that checks the login status
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response); //User defined callback function
  });
};

/* Loding Facebook SDK asynchronously */
(function(d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

/*  Callback function called after every status change  */
function statusChangeCallback(response) {
  // Check if returned response is okay
  if (response.status === "connected") {
    setElements(true);
    testAPI();
    console.log("Logged in and authenticated");
  } else {
    setElements(false);
    console.log("Not authenticated");
  }
}

/* Function called when the the FB login button is clicked */
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

/* Function does the following things
    -> Hides the FB login button if user is logged in and vice-versa
    -> Display the Logout button if the user is logged in and vice-versa 
    -> Hides and show the stuff according to the logged in and logged out status

    Takes one argument type:boolean

*/
function setElements(isLoggedIn) {
  if (isLoggedIn) {
    document.getElementById("profile").style.display = "block";
    document.getElementById("fb-logout").style.display = "block";
    document.getElementById("fb-btn").style.display = "none";
    document.getElementById("heading").style.display = "none";
  } else {
    document.getElementById("profile").style.display = "none";
    document.getElementById("fb-btn").style.display = "block";
    document.getElementById("fb-logout").style.display = "none";
    document.getElementById("heading").style.display = "block";
  }
}

/* Logout the user, calls the FB.logout() method */
function logout() {
  FB.logout(function(response) {
    setElements(false);
    document.getElementById("user_img").innerHTML = "";
    document.getElementById("posts").innerHTML = "";
    document.getElementById("images").innerHTML = "";
    console.log("Logged out successfully");
  });
}

/*  Functions for the Facebook Graph API */
function testAPI() {
  // Get all the fields specified in the fields parameter
  FB.api("/me?fields=name,email,birthday,location,posts,photos,link", function(
    response
  ) {
    if (response && !response.error) {
      console.log(response);
      buildProfile(response);
      setPosts(response);
      setPhotos(response);
    }
  });
}

/* Build user's profile using the response received */
function buildProfile(user) {
  let profile = `
              <h3>Welcome <span class="text-success"><a href="${
                user.link
              }" target="_blank">${user.name}</a></span></h3>
              <ul class="list-group mt-3">
                <li class="list-group-item">User ID : ${user.id}</li>
                <li class="list-group-item">User Email : ${user.email}</li>
                <li class="list-group-item">User Birthday : ${
                  user.birthday
                }</li>
                <li class="list-group-item">User Location : ${
                  user.location.name
                }</li>
              </ul>
               `;

  document.getElementById("profile").innerHTML = profile;

  // Getting User profile picture
  FB.api("/" + user.id + "/picture", "GET", { redirect: "false" }, function(
    response
  ) {
    console.log(response);
    // Show picture
    let dp = `
              <img src="${
                response.data.url
              }" lass="thumbnail rounded-circle" width="${
      response.data.width
    }" height="${response.data.height}">
        
            `;
    document.getElementById("user_img").innerHTML = dp;
  });
}

/* Fetching user's recent posts using Graph API */
function setPosts(feed) {
  //   console.log(feed);
  let postSection = `<h3>Latest Posts</h3><ul class="list-group">`;
  for (let i in feed.posts.data) {
    if (feed.posts.data[i].message) {
      postSection +=
        `
              <li class="list-group-item">${feed.posts.data[i].message}
              <br><small>Created : ` +
        moment(moment().format(feed.posts.data[i].created_time)).fromNow() +
        `</small>
              </li>
            `;
    }
  }

  postSection += `</ul>`;

  document.getElementById("posts").innerHTML = postSection;
}

/* Fetch user's latest photos using Graph API */
function setPhotos(response) {
  // console.log(response);

  imageSection = `<h3>Some of your photos</h3>`;

  for (let i in response.photos.data) {
    FB.api(
      "/" + response.photos.data[i].id,
      "GET",
      { fields: "images" },
      function(res) {
        // console.log(res);
        imageSection += `
            <div class="card pic-card" class="mx-2 my-2">
              <div class="card-image">
                <img src="${
                  res.images[2].source
                }" width="100%" height="100%" alt=""/>
              </div>
            </div>
          `;
        //   console.log(imageSection);
      }
    );
  }

  // Displays images after one second after fetching all the url's from Graph API
  setTimeout(() => {
    document.getElementById("images").innerHTML = imageSection;
  }, 1000);
}
