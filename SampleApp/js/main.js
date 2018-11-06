//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    // Helper variables.
    const app = WinJS.Application;
    const StorePurchaseStatus = Windows.Services.Store.StorePurchaseStatus;
    const storeContext = Windows.Services.Store.StoreContext.getDefault();
    let ex = null, propertySetStats = null;

    function basics1() {
        document.getElementById('output').innerHTML =
             SampleComponent.Example.getAnswer();

        ex = new SampleComponent.Example();

        document.getElementById('output').innerHTML += "<br/>" +
            ex.sampleProperty;
    }

    function basics2() {
        ex.sampleProperty += 1;
        document.getElementById('output').innerHTML += "<br/>" +
            ex.sampleProperty;
    }

    function runtime1() {
        document.getElementById('output').innerHTML = '';

        propertySetStats = new SampleComponent.PropertySetStats();
        let propertySet = propertySetStats.propertySet;

        propertySet.addEventListener('mapchanged', onMapChanged);

        propertySet.insert("FirstProperty", "First property value");
        propertySet.insert("SuperfluousProperty", "Unnecessary property value");
        propertySet.insert("AnotherProperty", "A property value");

        propertySet.insert("SuperfluousProperty", "Altered property value")
        propertySet.remove("SuperfluousProperty");

        document.getElementById('output').innerHTML += propertySetStats.displayStats();
    }

    // Handles changes to the RT data
    function onMapChanged(change) {
        let result;
        switch (change.collectionChange) {
            case Windows.Foundation.Collections.CollectionChange.reset:
                result = "All properties cleared";
                break;
            case Windows.Foundation.Collections.CollectionChange.itemInserted:
                result = "Inserted " + change.key + ": '" +
                    change.target.lookup(change.key) + "'";
                break;
            case Windows.Foundation.Collections.CollectionChange.itemRemoved:
                result = "Removed " + change.key;
                break;
            case Windows.Foundation.Collections.CollectionChange.itemChanged:
                result = "Changed " + change.key + " to '" +
                    change.target.lookup(change.key) + "'";
                break;
            default:
                break;
        }

        document.getElementById('output').innerHTML += "<br/>" + result;
    }

    // Get all products associated with the app
    // TODO: push this data to the output screen
    function getAssociatedProducts() {
        const productKinds = ["Consumable", "Durable", "UnmanagedConsumable"];
        storeContext.getAssociatedStoreProductsAsync(productKinds).then(function (addOns) {
            document.getElementById('output').innerHTML = "<div>" + JSON.stringify(addOns.products) + "</div>";
        });
    }

    function onLicenseChanged(sender, args) {
        getLicenseState();
    }

    function getLicenseState() {
        storeContext.getAppLicenseAsync().then(function (license) {
            let output = document.getElementById('output');
            if (license.isActive) {
                if (license.isTrial) {
                    output.innerText = "Trial license";
                } else {
                    output.innerText = "Full license";
                }
            } else {
                output.innerText = "Inactive license";
            }
        });
    }

    function purchaseFullLicense() {

        storeContext.requestPurchaseAsync('test_durable1').then(function (result) {
            console.log(result);
        });
        return
        storeContext.getStoreProductForCurrentAppAsync().then(function (productResult) {
            if (productResult.extendedError) {
                console.log(productResult.extendedError);
                return;
            }
            WinJS.log && WinJS.log("Buying the full license...", "sample", "status");
            storeContext.getAppLicenseAsync().then(function (license) {
                if (license.isTrial) {
                    return productResult.product.requestPurchaseAsync().then(function (result) {
                        switch (result.status) {
                            case StorePurchaseStatus.alreadyPurchased:
                                WinJS.log && WinJS.log("You already bought this app and have a fully-licensed version.", "sample", "error");
                                break;

                            case StorePurchaseStatus.succeeded:
                                // License will refresh automatically using the StoreContext.OfflineLicensesChanged event
                                break;

                            case StorePurchaseStatus.notPurchased:
                                WinJS.log && WinJS.log("Product was not purchased, it may have been canceled.", "sample", "error");
                                break;

                            case StorePurchaseStatus.networkError:
                                WinJS.log && WinJS.log("Product was not purchased due to a Network Error.", "sample", "error");
                                break;

                            case StorePurchaseStatus.serverError:
                                WinJS.log && WinJS.log("Product was not purchased due to a Server Error.", "sample", "error");
                                break;

                            default:
                                WinJS.log && WinJS.log("Product was not purchased due to an Unknown Error.", "sample", "error");
                                break;
                        }
                    });
                } else {
                    WinJS.log && WinJS.log("You already bought this app and have a fully-licensed version.", "sample", "error");
                }
            });
        });
    }

    app.onactivated = function (args) {
        args.setPromise(WinJS.UI.processAll().then(function () {
            const button1 = document.getElementById("button1");
            button1.addEventListener("click", basics1, false);
            const button2 = document.getElementById("button2");
            button2.addEventListener("click", basics2, false);
            const runtimeButton1 = document.getElementById('runtimeButton1');
            runtimeButton1.addEventListener('click', runtime1, false);

            const storeButton = document.getElementById('store');
            storeButton.addEventListener('click', purchaseFullLicense, false);
        }));
    };

    app.oncheckpoint = function (args) { };

    app.start();
})();
