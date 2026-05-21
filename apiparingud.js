// Credit goes to Simon Plenderleith.  https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/



async function handleSearch(event) {
  event.preventDefault();

  const raamatuId = document.getElementById("search_raamatu_id").value;
  const sone = document.getElementById("search_sone").value;

  const url = `https://hs-praks-12-webapp-otsing.azurewebsites.net/raamatu_otsing/${raamatuId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ sone: sone })
  });

  const data = await response.json();

  const resultElement = document.getElementById("otsinguTulemus");

  if (response.ok) {
    resultElement.innerHTML =
      `Raamat ${data.raamatu_id}<br>
                 Sõna: "${data.sone}"<br>
                 Leitud: ${data.leitud} korda`;
  } else {
    resultElement.innerHTML = "Viga";
  }
}

async function postFormDataAsJson({ url, formData }) {
  /**
   * We can't pass the `FormData` instance directly to `fetch`
   * as that will cause it to automatically format the request
   * body as "multipart" and set the `Content-Type` request header
   * to `multipart/form-data`. We want to send the request body
   * as JSON, so we're converting it to a plain object and then
   * into a JSON string.
   */
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    // The default method for a request with fetch is GET, so we must tell it to use the POST HTTP method.
    method: "POST",
    /**
     * These headers will be added to the request and tell
     * the API that the request body is JSON and that we can
     * accept JSON responses.
     */
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    // The body of our POST request is the JSON string that we created above.
    body: formDataJsonString,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

async function getDataAsJson(url) {

  const fetchOptions = {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  };
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return response.json();
}


async function deleteObject(url) {

  const fetchOptions = {
    method: "DELETE"
  };
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  listiraamatud();
}

function test() { console.log }
async function handleFormSubmit(event) {
  // This prevents the default behaviour of the browser submitting the form so that we can handle things instead.
  event.preventDefault();

  // This gets the element which the event handler was attached to.
  const form = event.currentTarget;

  // This takes the API URL from the form's `action` attribute.
  const url = form.action;

  try {
    // This takes all the fields in the form and makes their values available through a `FormData` instance.
    const formData = new FormData(form);

    //We'll define the `postFormDataAsJson()` function in the next step.
    const responseData = await postFormDataAsJson({ url, formData });

    // we'll  log the response it to the console.
    console.log({ responseData });
    handleResponse(form, responseData);
  } catch (error) {
    console.error(error);
  }
}

async function listiraamatud() {

  const responseData = await getDataAsJson("https://hs-praks-12-webapp.azurewebsites.net/raamatud/");
  const resultElement = document.getElementById("raamatud_result");
  resultElement.innerHTML = "";

  for (var raamat of responseData.raamatud) {
    let name = raamat.split('.')[0];
	resultElement.innerHTML +=
  '<a href="https://hs-praks-12-webapp.azurewebsites.net/raamatud/' + name + '" download="' + name + '.txt">' +
  name + '.txt</a> ' +

  '<a href="https://hs-praks-12-webapp.azurewebsites.net/raamatud/' + name + '/pdf" target="_blank">' +
  name + '.pdf</a> ' +

  '<a href="#" onclick="deleteObject(\'https://hs-praks-12-webapp.azurewebsites.net/raamatud/' + name + '\')">[kustuta]</a>' +
  '<br />';
    }
}


function handleResponse(form, responseData) {
  const resultElement = document.getElementById("tulemus");
  if (form.id == "frontform") {
    resultElement.innerHTML = responseData.tulemus;
    listiraamatud();
  }

  if (form.id === "otsinguform") {
    var output = "Sõne " + responseData.sone + " leiti järgmistest raamatutest: <br/>"

    for (var tulemus of responseData.tulemused) {
      output += "Raamat " + tulemus.raamatu_id + " - " + tulemus.leitud + " korda! <br/>";
    }

    resultElement.innerHTML = output;
  }
}





