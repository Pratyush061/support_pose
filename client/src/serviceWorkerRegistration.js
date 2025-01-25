const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );
  
  export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  
      // Ensure service worker is only used on the same origin
      if (publicUrl.origin !== window.location.origin) {
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        if (isLocalhost) {
          // Validate service worker for localhost
          checkValidServiceWorker(swUrl, config);
  
          navigator.serviceWorker.ready.then(() => {
            console.log(
              'This web app is being served cache-first by a service worker. ' +
              'To learn more, visit https://cra.link/PWA'
            );
          });
        } else {
          // Register service worker for production
          registerValidSW(swUrl, config);
        }
      });
    }
  }
  
  function registerValidSW(swUrl, config) {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Monitor updates to the service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
  
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Service worker updated
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // Service worker installed for the first time
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Error during service worker registration:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl, config) {
    // Check if the service worker exists and is valid
    fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    })
      .then((response) => {
        const contentType = response.headers.get('content-type');
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          // Unregister invalid service worker and reload
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          // Register valid service worker
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log(
          'No internet connection found. App is running in offline mode.'
        );
      });
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  }
  


























// const isLocalhost = Boolean(
//     window.location.hostname === 'localhost' ||
//       window.location.hostname === '[::1]' ||
//       window.location.hostname.match(
//         /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
//       )
//   );
  
//   export function register(config) {
//     if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
//       const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
//       if (publicUrl.origin !== window.location.origin) {
//         return;
//       }
  
//       window.addEventListener('load', () => {
//         const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
//         if (isLocalhost) {
//           checkValidServiceWorker(swUrl, config);
  
//           navigator.serviceWorker.ready.then(() => {
//             console.log(
//               'This web app is being served cache-first by a service ' +
//                 'worker. To learn more, visit https://cra.link/PWA'
//             );
//           });
//         } else {
//           registerValidSW(swUrl, config);
//         }
//       });
//     }
//   }
  
//   function registerValidSW(swUrl, config) {
//     navigator.serviceWorker
//       .register(swUrl)
//       .then((registration) => {
//         registration.onupdatefound = () => {
//           const installingWorker = registration.installing;
//           if (installingWorker == null) {
//             return;
//           }
//           installingWorker.onstatechange = () => {
//             if (installingWorker.state === 'installed') {
//               if (navigator.serviceWorker.controller) {
//                 if (config && config.onUpdate) {
//                   config.onUpdate(registration);
//                 }
//               } else {
//                 if (config && config.onSuccess) {
//                   config.onSuccess(registration);
//                 }
//               }
//             }
//           };
//         };
//       })
//       .catch((error) => {
//         console.error('Error during service worker registration:', error);
//       });
//   }
  
//   function checkValidServiceWorker(swUrl, config) {
//     fetch(swUrl, {
//       headers: { 'Service-Worker': 'script' }
//     })
//       .then((response) => {
//         const contentType = response.headers.get('content-type');
//         if (
//           response.status === 404 ||
//           (contentType != null && contentType.indexOf('javascript') === -1)
//         ) {
//           navigator.serviceWorker.ready.then((registration) => {
//             registration.unregister().then(() => {
//               window.location.reload();
//             });
//           });
//         } else {
//           registerValidSW(swUrl, config);
//         }
//       })
//       .catch(() => {
//         console.log(
//           'No internet connection found. App is running in offline mode.'
//         );
//       });
//   }
  
//   export function unregister() {
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.ready
//         .then((registration) => {
//           registration.unregister();
//         })
//         .catch((error) => {
//           console.error(error.message);
//         });
//     }
//   }