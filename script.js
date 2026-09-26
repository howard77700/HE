let db;

let songs = [];

let currentSongIndex = -1;

let currentPage = "home";

let shuffleMode = false;

let repeatMode = false;

let deleteSongId = null;

let coverData = "";


/* =========================
   ELEMENTS
========================= */

const audio = document.getElementById("audio");

const currentCover = document.getElementById("currentCover");

const playerDefaultCover =
    document.getElementById("playerDefaultCover");

const currentTitle =
    document.getElementById("currentTitle");

const currentArtist =
    document.getElementById("currentArtist");

const playBtn =
    document.getElementById("playBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const shuffleBtn =
    document.getElementById("shuffleBtn");

const repeatBtn =
    document.getElementById("repeatBtn");

const favoriteBtn =
    document.getElementById("favoriteBtn");

const progress =
    document.getElementById("progress");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");


/* =========================
   GREETING
========================= */

function setGreeting() {

    const hour = new Date().getHours();

    let greeting = "";

    if (hour >= 5 && hour < 12) {

        greeting = "Good morning";

    } else if (hour >= 12 && hour < 18) {

        greeting = "Good afternoon";

    } else if (hour >= 18 && hour < 22) {

        greeting = "Good evening";

    } else {

        greeting = "Good night";
    }

    document.getElementById("greeting").textContent =
        greeting;
}


/* =========================
   DATABASE
========================= */

function openDatabase() {

    const request = indexedDB.open(
        "HEMusicDatabase",
        1
    );


    request.onupgradeneeded = function(event) {

        db = event.target.result;

        if (!db.objectStoreNames.contains("songs")) {

            db.createObjectStore(
                "songs",
                {
                    keyPath: "id",
                    autoIncrement: true
                }
            );
        }
    };


    request.onsuccess = function(event) {

        db = event.target.result;

        loadSongs();
    };


    request.onerror = function() {

        console.log("Database error");
    };
}


/* =========================
   LOAD SONGS
========================= */

function loadSongs() {

    const transaction =
        db.transaction(
            ["songs"],
            "readonly"
        );

    const store =
        transaction.objectStore("songs");

    const request =
        store.getAll();


    request.onsuccess = function() {

        songs = request.result;

        renderSongs();

        updatePlayer();
    };
}


/* =========================
   SAVE SONG
========================= */

function saveSong(song) {

    const transaction =
        db.transaction(
            ["songs"],
            "readwrite"
        );

    const store =
        transaction.objectStore("songs");

    store.add(song);

    transaction.oncomplete = function() {

        loadSongs();
    };
}


/* =========================
   NAVIGATION
========================= */

function showPage(page) {

    currentPage = page;


    document
        .querySelectorAll(".page")
        .forEach(function(item) {

            item.classList.remove(
                "active-page"
            );
        });


    document
        .getElementById(page + "Page")
        .classList.add(
            "active-page"
        );


    document
        .querySelectorAll(".menu-item")
        .forEach(function(item) {

            item.classList.remove("active");
        });


    if (page === "home") {

        document
            .getElementById("navHome")
            .classList.add("active");

    } else if (page === "songs") {

        document
            .getElementById("navSongs")
            .classList.add("active");

    } else if (page === "favorites") {

        document
            .getElementById("navFavorites")
            .classList.add("active");
    }


    renderSongs();
}


/* =========================
   NAV BUTTONS
========================= */

document
    .getElementById("navHome")
    .addEventListener(
        "click",
        function() {

            showPage("home");
        }
    );


document
    .getElementById("navSongs")
    .addEventListener(
        "click",
        function() {

            showPage("songs");
        }
    );


document
    .getElementById("navFavorites")
    .addEventListener(
        "click",
        function() {

            showPage("favorites");
        }
    );


document
    .getElementById("navAbout")
    .addEventListener(
        "click",
        function() {

            showPage("about");
        }
    );


document
    .getElementById("startListening")
    .addEventListener(
        "click",
        function() {

            showPage("songs");
        }
    );


/* =========================
   RENDER SONGS
========================= */

function renderSongs() {

    let result = songs.slice();


    /* SEARCH */

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    if (search !== "") {

        result = result.filter(
            function(song) {

                return (
                    song.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    song.artist
                        .toLowerCase()
                        .includes(search)
                );
            }
        );
    }


    /* FAVORITES */

    if (currentPage === "favorites") {

        result = result.filter(
            function(song) {

                return song.favorite === true;
            }
        );
    }


    /* HOME */

    if (currentPage === "home") {

        renderSongContainer(
            "recentSongs",
            result.slice(-5).reverse()
        );

        return;
    }


    /* SONGS */

    if (currentPage === "songs") {

        renderSongContainer(
            "allSongs",
            result
        );

        return;
    }


    /* FAVORITES */

    if (currentPage === "favorites") {

        renderSongContainer(
            "favoriteSongs",
            result
        );
    }
}


/* =========================
   RENDER SONG CONTAINER
========================= */

function renderSongContainer(
    containerId,
    list
) {

    const container =
        document.getElementById(
            containerId
        );


    container.innerHTML = "";


    if (list.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-message";

        if (currentPage === "favorites") {

            empty.textContent =
                "You don't have any favorite songs yet.";

        } else {

            empty.textContent =
                "No songs found.";
        }

        container.appendChild(empty);

        return;
    }


    list.forEach(
        function(song) {

            const item =
                createSongElement(song);

            container.appendChild(item);
        }
    );
}


/* =========================
   CREATE SONG ELEMENT
========================= */

function createSongElement(song) {

    const item =
        document.createElement("div");

    item.className = "song-item";


    if (
        currentSongIndex !== -1 &&
        songs[currentSongIndex] &&
        songs[currentSongIndex].id === song.id
    ) {

        item.classList.add("active");
    }


    /* COVER */

    const cover =
        document.createElement("div");

    cover.className =
        "song-cover";


    if (song.cover) {

        const img =
            document.createElement("img");

        img.src = song.cover;

        cover.appendChild(img);

    } else {

        const defaultCover =
            document.createElement("div");

        defaultCover.className =
            "default-cover";

        defaultCover.textContent = "和";

        cover.appendChild(defaultCover);
    }


    /* INFO */

    const info =
        document.createElement("div");

    info.className =
        "song-info";


    const title =
        document.createElement("h4");

    title.textContent =
        song.title;


    const artist =
        document.createElement("p");

    artist.textContent =
        song.artist;


    info.appendChild(title);

    info.appendChild(artist);


    /* ACTIONS */

    const actions =
        document.createElement("div");

    actions.className =
        "song-actions";


    const favorite =
        document.createElement("button");

    favorite.type = "button";

    if (song.favorite) {

        favorite.textContent = "♥";

        favorite.classList.add(
            "favorite-active"
        );

    } else {

        favorite.textContent = "♡";
    }


    favorite.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            toggleFavorite(song.id);
        }
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.textContent = "×";


    deleteButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openDeleteModal(song.id);
        }
    );


    actions.appendChild(favorite);

    actions.appendChild(deleteButton);


    item.appendChild(cover);

    item.appendChild(info);

    item.appendChild(actions);


    item.addEventListener(
        "click",
        function() {

            const index =
                songs.findIndex(
                    function(item) {

                        return item.id === song.id;
                    }
                );

            if (index !== -1) {

                playSong(index);
            }
        }
    );


    return item;
}


/* =========================
   PLAY SONG
========================= */

function playSong(index) {

    if (!songs[index]) {
        return;
    }


    currentSongIndex = index;


    const song = songs[index];


    const url =
        URL.createObjectURL(song.audio);


    audio.src = url;


    currentTitle.textContent =
        song.title;


    currentArtist.textContent =
        song.artist;


    if (song.cover) {

        currentCover.src =
            song.cover;

        currentCover.style.display =
            "block";

        playerDefaultCover.style.display =
            "none";

    } else {

        currentCover.src = "";

        currentCover.style.display =
            "none";

        playerDefaultCover.style.display =
            "flex";
    }


    updateFavoriteButton();


    audio.play()
        .then(function() {

            playBtn.textContent = "❚❚";

        })
        .catch(function() {

            playBtn.textContent = "▶";
        });


    renderSongs();
}


/* =========================
   PLAY / PAUSE
========================= */

playBtn.addEventListener(
    "click",
    function() {

        if (currentSongIndex === -1) {

            if (songs.length > 0) {

                playSong(0);
            }

            return;
        }


        if (audio.paused) {

            audio.play();

            playBtn.textContent = "❚❚";

        } else {

            audio.pause();

            playBtn.textContent = "▶";
        }
    }
);


/* =========================
   FAVORITE
========================= */

function toggleFavorite(id) {

    const index =
        songs.findIndex(
            function(song) {

                return song.id === id;
            }
        );


    if (index === -1) {
        return;
    }


    songs[index].favorite =
        !songs[index].favorite;


    const transaction =
        db.transaction(
            ["songs"],
            "readwrite"
        );


    const store =
        transaction.objectStore("songs");


    store.put(songs[index]);


    transaction.oncomplete =
        function() {

            updateFavoriteButton();

            renderSongs();
        };
}


/* =========================
   PLAYER FAVORITE BUTTON
========================= */

favoriteBtn.addEventListener(
    "click",
    function() {

        if (currentSongIndex === -1) {
            return;
        }


        const song =
            songs[currentSongIndex];


        toggleFavorite(song.id);
    }
);


/* =========================
   UPDATE FAVORITE BUTTON
========================= */

function updateFavoriteButton() {

    if (currentSongIndex === -1) {

        favoriteBtn.textContent = "♡";

        favoriteBtn.classList.remove(
            "favorite-active"
        );

        return;
    }


    const song =
        songs[currentSongIndex];


    if (song.favorite) {

        favoriteBtn.textContent = "♥";

        favoriteBtn.classList.add(
            "favorite-active"
        );

    } else {

        favoriteBtn.textContent = "♡";

        favoriteBtn.classList.remove(
            "favorite-active"
        );
    }
}


/* =========================
   SHUFFLE
========================= */

shuffleBtn.addEventListener(
    "click",
    function() {

        shuffleMode =
            !shuffleMode;


        if (shuffleMode) {

            shuffleBtn.classList.add(
                "active"
            );

        } else {

            shuffleBtn.classList.remove(
                "active"
            );
        }
    }
);


/* =========================
   REPEAT
========================= */

repeatBtn.addEventListener(
    "click",
    function() {

        repeatMode =
            !repeatMode;


        if (repeatMode) {

            repeatBtn.classList.add(
                "active"
            );

        } else {

            repeatBtn.classList.remove(
                "active"
            );
        }
    }
);


/* =========================
   NEXT
========================= */

nextBtn.addEventListener(
    "click",
    function() {

        if (songs.length === 0) {
            return;
        }


        let nextIndex;


        if (shuffleMode) {

            nextIndex =
                Math.floor(
                    Math.random() *
                    songs.length
                );

        } else {

            nextIndex =
                currentSongIndex + 1;

            if (
                nextIndex >=
                songs.length
            ) {

                nextIndex = 0;
            }
        }


        playSong(nextIndex);
    }
);


/* =========================
   PREVIOUS
========================= */

prevBtn.addEventListener(
    "click",
    function() {

        if (songs.length === 0) {
            return;
        }


        let previousIndex =
            currentSongIndex - 1;


        if (previousIndex < 0) {

            previousIndex =
                songs.length - 1;
        }


        playSong(previousIndex);
    }
);


/* =========================
   AUDIO ENDED
========================= */

audio.addEventListener(
    "ended",
    function() {

        if (repeatMode) {

            audio.currentTime = 0;

            audio.play();

            return;
        }


        if (songs.length > 0) {

            let nextIndex;


            if (shuffleMode) {

                nextIndex =
                    Math.floor(
                        Math.random() *
                        songs.length
                    );

            } else {

                nextIndex =
                    currentSongIndex + 1;

                if (
                    nextIndex >=
                    songs.length
                ) {

                    nextIndex = 0;
                }
            }


            playSong(nextIndex);
        }
    }
);


/* =========================
   PROGRESS
========================= */

audio.addEventListener(
    "loadedmetadata",
    function() {

        progress.max =
            audio.duration;

        duration.textContent =
            formatTime(audio.duration);
    }
);


audio.addEventListener(
    "timeupdate",
    function() {

        progress.value =
            audio.currentTime;

        currentTime.textContent =
            formatTime(
                audio.currentTime
            );
    }
);


progress.addEventListener(
    "input",
    function() {

        audio.currentTime =
            progress.value;
    }
);


/* =========================
   TIME FORMAT
========================= */

function formatTime(seconds) {

    if (!seconds ||
        isNaN(seconds)) {

        return "0:00";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secondsLeft =
        Math.floor(
            seconds % 60
        );


    if (secondsLeft < 10) {

        return minutes +
            ":0" +
            secondsLeft;
    }


    return minutes +
        ":" +
        secondsLeft;
}


/* =========================
   ADD MUSIC MODAL
========================= */

const addModal =
    document.getElementById(
        "addModal"
    );


const musicFile =
    document.getElementById(
        "musicFile"
    );


const artistInput =
    document.getElementById(
        "artistInput"
    );


const coverFile =
    document.getElementById(
        "coverFile"
    );


function openAddModal() {

    addModal.classList.add("show");
}


function closeAddModal() {

    addModal.classList.remove("show");

    musicFile.value = "";

    artistInput.value = "";

    coverFile.value = "";

    coverData = "";
}


/* ADD BUTTONS */

document
    .getElementById("addMusicHome")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("addMusicSongs")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .getElementById("closeAddModal")
    .addEventListener(
        "click",
        closeAddModal
    );


/* COVER */

coverFile.addEventListener(
    "change",
    function() {

        const file =
            coverFile.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                coverData =
                    event.target.result;
            };


        reader.readAsDataURL(file);
    }
);


/* SAVE MUSIC */

document
    .getElementById("saveMusic")
    .addEventListener(
        "click",
        function() {

            const file =
                musicFile.files[0];


            const artist =
                artistInput.value.trim();


            if (!file) {

                alert(
                    "Please choose an MP3 file."
                );

                return;
            }


            if (!artist) {

                alert(
                    "Please enter the artist name."
                );

                return;
            }


            const title =
                file.name.replace(
                    ".mp3",
                    ""
                );


            const song = {

                title: title,

                artist: artist,

                audio: file,

                cover: coverData,

                favorite: false,

                createdAt:
                    new Date().getTime()
            };


            saveSong(song);


            closeAddModal();
        }
    );


/* =========================
   DELETE MODAL
========================= */

const deleteModal =
    document.getElementById(
        "deleteModal"
    );


function openDeleteModal(id) {

    deleteSongId = id;

    deleteModal.classList.add(
        "show"
    );
}


function closeDeleteModal() {

    deleteSongId = null;

    deleteModal.classList.remove(
        "show"
    );
}


document
    .getElementById("cancelDelete")
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById("confirmDelete")
    .addEventListener(
        "click",
        function() {

            if (deleteSongId === null) {
                return;
            }


            const transaction =
                db.transaction(
                    ["songs"],
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    "songs"
                );


            store.delete(
                deleteSongId
            );


            transaction.oncomplete =
                function() {

                    if (
                        currentSongIndex !== -1 &&
                        songs[currentSongIndex] &&
                        songs[currentSongIndex].id ===
                        deleteSongId
                    ) {

                        audio.pause();

                        audio.src = "";

                        currentSongIndex = -1;

                        currentTitle.textContent =
                            "No Song";

                        currentArtist.textContent =
                            "Choose a song";

                        currentCover.src = "";

                        currentCover.style.display =
                            "none";

                        playerDefaultCover.style.display =
                            "flex";

                        playBtn.textContent =
                            "▶";

                        updateFavoriteButton();
                    }


                    closeDeleteModal();

                    loadSongs();
                };
        }
    );


/* =========================
   SEARCH
========================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function() {

            renderSongs();
        }
    );


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" &&
            document.activeElement.tagName !== "INPUT"
        ) {

            event.preventDefault();

            playBtn.click();
        }
    }
);


/* =========================
   UPDATE PLAYER
========================= */

function updatePlayer() {

    if (currentSongIndex === -1) {

        currentTitle.textContent =
            "No Song";

        currentArtist.textContent =
            "Choose a song";

        currentCover.src = "";

        currentCover.style.display =
            "none";

        playerDefaultCover.style.display =
            "flex";

        updateFavoriteButton();

        return;
    }


    const song =
        songs[currentSongIndex];


    if (!song) {
        return;
    }


    currentTitle.textContent =
        song.title;

    currentArtist.textContent =
        song.artist;


    if (song.cover) {

        currentCover.src =
            song.cover;

        currentCover.style.display =
            "block";

        playerDefaultCover.style.display =
            "none";

    } else {

        currentCover.style.display =
            "none";

        playerDefaultCover.style.display =
            "flex";
    }


    updateFavoriteButton();
}


/* =========================
   INITIALIZE
========================= */

setGreeting();

openDatabase();


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register("./sw.js")
                .then(
                    function() {

                        console.log(
                            "HE PWA aktif"
                        );
                    }
                )
                .catch(
                    function(error) {

                        console.log(
                            "Service Worker gagal:",
                            error
                        );
                    }
                );
        }
    );
}