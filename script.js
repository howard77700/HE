const audio = document.getElementById("audio");

const greeting = document.getElementById("greeting");

const searchInput = document.getElementById("searchInput");

const homePage = document.getElementById("homePage");
const songsPage = document.getElementById("songsPage");
const aboutPage = document.getElementById("aboutPage");

const songsContainer = document.getElementById("songsContainer");
const recentContainer = document.getElementById("recentContainer");

const songsTitle = document.getElementById("songsTitle");

const navHome = document.getElementById("navHome");
const navSongs = document.getElementById("navSongs");
const navFavorites = document.getElementById("navFavorites");
const navAbout = document.getElementById("navAbout");

const startListening = document.getElementById("startListening");

const addMusicBtn = document.getElementById("addMusicBtn");

const addModal = document.getElementById("addModal");
const closeAddModal = document.getElementById("closeAddModal");

const musicInput = document.getElementById("musicInput");
const artistInput = document.getElementById("artistInput");
const coverInput = document.getElementById("coverInput");

const coverPreview = document.getElementById("coverPreview");

const saveMusicBtn = document.getElementById("saveMusicBtn");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const currentCover = document.getElementById("currentCover");
const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");

const favoriteBtn = document.getElementById("favoriteBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const repeatBtn = document.getElementById("repeatBtn");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");


let songs = [];

let currentSongIndex = -1;

let currentPage = "home";

let deleteSongId = null;

let shuffle = false;

let repeat = false;

let coverData = null;


const DB_NAME = "HEMusicDB";

const DB_VERSION = 4;

const STORE_NAME = "songs";


let db;


function openDatabase() {

    return new Promise(function(resolve, reject) {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        request.onupgradeneeded = function(event) {

            const database = event.target.result;


            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

        };


        request.onsuccess = function(event) {

            db = event.target.result;

            resolve(db);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}



function getAllSongs() {

    return new Promise(function(resolve, reject) {

        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.getAll();


        request.onsuccess = function() {

            resolve(request.result);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}



function addSong(song) {

    return new Promise(function(resolve, reject) {

        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.add(song);


        request.onsuccess = function() {

            resolve(request.result);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}



function updateSong(song) {

    return new Promise(function(resolve, reject) {

        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.put(song);


        request.onsuccess = function() {

            resolve();

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}



function deleteSong(id) {

    return new Promise(function(resolve, reject) {

        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(
            STORE_NAME
        );

        const request = store.delete(id);


        request.onsuccess = function() {

            resolve();

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}



function setGreeting() {

    const hour = new Date().getHours();


    if (hour >= 5 && hour < 12) {

        greeting.textContent =
            "Good morning";

    }

    else if (hour >= 12 && hour < 18) {

        greeting.textContent =
            "Good afternoon";

    }

    else if (hour >= 18 && hour < 22) {

        greeting.textContent =
            "Good evening";

    }

    else {

        greeting.textContent =
            "Good night";

    }

}



function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}



function formatTime(seconds) {

    if (!seconds || isNaN(seconds)) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const secs =
        Math.floor(seconds % 60);


    return minutes +
        ":" +
        String(secs).padStart(2, "0");

}



function showPage(page) {

    currentPage = page;


    homePage.style.display = "none";

    songsPage.style.display = "none";

    aboutPage.style.display = "none";


    navHome.classList.remove("active");

    navSongs.classList.remove("active");

    navFavorites.classList.remove("active");


    if (page === "home") {

        homePage.style.display = "block";

        navHome.classList.add("active");

        searchInput.value = "";

        renderRecent();

    }


    else if (page === "songs") {

        songsPage.style.display = "block";

        navSongs.classList.add("active");

        songsTitle.textContent = "All Songs";

        renderSongs();

    }


    else if (page === "favorites") {

        songsPage.style.display = "block";

        navFavorites.classList.add("active");

        songsTitle.textContent =
            "Your Favorite Music";

        renderSongs();

    }


    else if (page === "about") {

        aboutPage.style.display = "block";

    }

}



function getFilteredSongs() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    let result = songs;


    if (currentPage === "favorites") {

        result = songs.filter(function(song) {

            return song.favorite === true;

        });

    }


    if (search !== "") {

        result = result.filter(function(song) {

            const title =
                song.title.toLowerCase();

            const artist =
                song.artist.toLowerCase();


            return title.includes(search) ||
                artist.includes(search);

        });

    }


    return result;

}



function renderSongs() {

    songsContainer.innerHTML = "";


    const list = getFilteredSongs();


    if (list.length === 0) {

        songsContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    No Music Found
                </h3>

                <p>
                    Add music or try another search.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(function(song) {

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


        let coverHTML;


        if (song.cover) {

            coverHTML = `

                <img
                    class="song-cover"
                    src="${song.cover}"
                    alt=""
                >

            `;

        }

        else {

            coverHTML = `

                <div class="song-default-cover">
                    和
                </div>

            `;

        }


        const favoriteIcon =
            song.favorite ? "♥" : "♡";


        item.innerHTML = `

            ${coverHTML}

            <div class="song-details">

                <h4>
                    ${escapeHTML(song.title)}
                </h4>

                <p>
                    ${escapeHTML(song.artist)}
                </p>

            </div>


            <div class="song-actions">

                <button
                    class="favorite-song"
                    type="button"
                >
                    ${favoriteIcon}
                </button>


                <button
                    class="delete-song"
                    type="button"
                >
                    ×
                </button>

            </div>

        `;


        item.addEventListener(
            "click",
            function(event) {

                if (
                    event.target.closest(
                        ".song-actions"
                    )
                ) {

                    return;

                }


                const index =
                    songs.findIndex(function(item) {

                        return item.id === song.id;

                    });


                playSong(index);

            }
        );


        const favoriteSong =
            item.querySelector(
                ".favorite-song"
            );


        favoriteSong.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                toggleFavorite(song.id);

            }
        );


        const deleteSongButton =
            item.querySelector(
                ".delete-song"
            );


        deleteSongButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                openDeleteModal(song.id);

            }
        );


        songsContainer.appendChild(item);

    });

}



function renderRecent() {

    recentContainer.innerHTML = "";


    if (songs.length === 0) {

        recentContainer.innerHTML = `

            <div class="empty-state">

                <h3>
                    No Music Yet
                </h3>

                <p>
                    Click Add Music to add your first song.
                </p>

            </div>

        `;

        return;

    }


    const recent =
        songs.slice(-5).reverse();


    recent.forEach(function(song) {

        const card =
            document.createElement("div");


        card.className =
            "recent-card";


        let coverHTML;


        if (song.cover) {

            coverHTML = `

                <img
                    class="recent-cover"
                    src="${song.cover}"
                    alt=""
                >

            `;

        }

        else {

            coverHTML = `

                <div class="recent-default-cover">
                    和
                </div>

            `;

        }


        card.innerHTML = `

            ${coverHTML}

            <h4>
                ${escapeHTML(song.title)}
            </h4>

            <p>
                ${escapeHTML(song.artist)}
            </p>

        `;


        card.addEventListener(
            "click",
            function() {

                const index =
                    songs.findIndex(function(item) {

                        return item.id === song.id;

                    });


                playSong(index);

            }
        );


        recentContainer.appendChild(card);

    });

}



function playSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {

        return;

    }


    currentSongIndex = index;


    const song =
        songs[currentSongIndex];


    const blob =
        new Blob(
            [song.audio],
            {
                type: "audio/mpeg"
            }
        );


    const url =
        URL.createObjectURL(blob);


    audio.src = url;


    audio.volume =
        Number(volume.value);


    currentTitle.textContent =
        song.title;


    currentArtist.textContent =
        song.artist;


    if (song.cover) {

        currentCover.src =
            song.cover;

        currentCover.style.display =
            "block";

    }

    else {

        currentCover.style.display =
            "none";

    }


    updateFavoriteButton();


    audio.play()
        .then(function() {

            playBtn.textContent = "❚❚";

        })
        .catch(function() {

            playBtn.textContent = "▶";

        });


    if (
        currentPage === "songs" ||
        currentPage === "favorites"
    ) {

        renderSongs();

    }

}



function togglePlay() {

    if (currentSongIndex === -1) {

        if (songs.length > 0) {

            playSong(0);

        }

        return;

    }


    if (audio.paused) {

        audio.play();

        playBtn.textContent = "❚❚";

    }

    else {

        audio.pause();

        playBtn.textContent = "▶";

    }

}



function nextSong() {

    if (songs.length === 0) {

        return;

    }


    let nextIndex;


    if (shuffle) {

        nextIndex =
            Math.floor(
                Math.random() * songs.length
            );

    }

    else {

        nextIndex =
            currentSongIndex + 1;


        if (nextIndex >= songs.length) {

            nextIndex = 0;

        }

    }


    playSong(nextIndex);

}



function previousSong() {

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



function updateFavoriteButton() {

    if (currentSongIndex === -1) {

        favoriteBtn.textContent = "♡";

        favoriteBtn.classList.remove("active");

        return;

    }


    const song =
        songs[currentSongIndex];


    if (song.favorite) {

        favoriteBtn.textContent = "♥";

        favoriteBtn.classList.add("active");

    }

    else {

        favoriteBtn.textContent = "♡";

        favoriteBtn.classList.remove("active");

    }

}



async function toggleFavorite(id) {

    const index =
        songs.findIndex(function(song) {

            return song.id === id;

        });


    if (index === -1) {

        return;

    }


    songs[index].favorite =
        !songs[index].favorite;


    await updateSong(
        songs[index]
    );


    updateFavoriteButton();

    renderSongs();

}



function openDeleteModal(id) {

    deleteSongId = id;

    deleteModal.classList.add("show");

}



function closeDeleteModal() {

    deleteSongId = null;

    deleteModal.classList.remove("show");

}



async function confirmDelete() {

    if (deleteSongId === null) {

        return;

    }


    const index =
        songs.findIndex(function(song) {

            return song.id === deleteSongId;

        });


    if (index === -1) {

        closeDeleteModal();

        return;

    }


    if (currentSongIndex === index) {

        audio.pause();

        audio.src = "";

        currentSongIndex = -1;

        currentTitle.textContent =
            "No Song";

        currentArtist.textContent =
            "Choose a song";

        currentCover.style.display =
            "none";

        playBtn.textContent =
            "▶";

        updateFavoriteButton();

    }


    await deleteSong(deleteSongId);


    songs.splice(index, 1);


    if (
        currentSongIndex > index
    ) {

        currentSongIndex--;

    }


    closeDeleteModal();


    renderRecent();

    renderSongs();

}



function openAddModal() {

    addModal.classList.add("show");

}



function closeAddMusicModal() {

    addModal.classList.remove("show");

    musicInput.value = "";

    artistInput.value = "";

    coverInput.value = "";

    coverPreview.src = "";

    coverPreview.style.display =
        "none";

    coverData = null;

}



function readFileAsDataURL(file) {

    return new Promise(function(resolve, reject) {

        const reader =
            new FileReader();


        reader.onload = function() {

            resolve(reader.result);

        };


        reader.onerror = function() {

            reject(reader.error);

        };


        reader.readAsDataURL(file);

    });

}



async function saveMusic() {

    const musicFile =
        musicInput.files[0];


    if (!musicFile) {

        alert("Please select an MP3 file.");

        return;

    }


    let artist =
        artistInput.value.trim();


    if (artist === "") {

        artist = "Unknown Artist";

    }


    let title =
        musicFile.name;


    if (title.toLowerCase().endsWith(".mp3")) {

        title =
            title.substring(
                0,
                title.length - 4
            );

    }


    const audioData =
        await musicFile.arrayBuffer();


    const song = {

        title: title,

        artist: artist,

        audio: audioData,

        cover: coverData,

        favorite: false,

        addedAt: Date.now()

    };


    await addSong(song);


    songs =
        await getAllSongs();


    closeAddMusicModal();


    renderRecent();


    if (currentPage === "songs") {

        renderSongs();

    }


    alert("Music added to HE.");

}



coverInput.addEventListener(
    "change",
    async function() {

        const file =
            coverInput.files[0];


        if (!file) {

            return;

        }


        coverData =
            await readFileAsDataURL(file);


        coverPreview.src =
            coverData;


        coverPreview.style.display =
            "block";

    }
);



saveMusicBtn.addEventListener(
    "click",
    saveMusic
);


addMusicBtn.addEventListener(
    "click",
    openAddModal
);


closeAddModal.addEventListener(
    "click",
    closeAddMusicModal
);


cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


confirmDeleteBtn.addEventListener(
    "click",
    confirmDelete
);



favoriteBtn.addEventListener(
    "click",
    function() {

        if (currentSongIndex === -1) {

            return;

        }


        toggleFavorite(
            songs[currentSongIndex].id
        );

    }
);



playBtn.addEventListener(
    "click",
    togglePlay
);


nextBtn.addEventListener(
    "click",
    nextSong
);


prevBtn.addEventListener(
    "click",
    previousSong
);



shuffleBtn.addEventListener(
    "click",
    function() {

        shuffle =
            !shuffle;


        shuffleBtn.style.color =
            shuffle
                ? "#d94f68"
                : "#888";

    }
);



repeatBtn.addEventListener(
    "click",
    function() {

        repeat =
            !repeat;


        repeatBtn.style.color =
            repeat
                ? "#d94f68"
                : "#888";

    }
);



audio.addEventListener(
    "timeupdate",
    function() {

        if (!isNaN(audio.duration)) {

            progress.max =
                audio.duration;

            progress.value =
                audio.currentTime;

            currentTime.textContent =
                formatTime(
                    audio.currentTime
                );

            duration.textContent =
                formatTime(
                    audio.duration
                );

        }

    }
);



audio.addEventListener(
    "loadedmetadata",
    function() {

        progress.max =
            audio.duration;

        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);



progress.addEventListener(
    "input",
    function() {

        audio.currentTime =
            Number(progress.value);

    }
);



volume.addEventListener(
    "input",
    function() {

        audio.volume =
            Number(volume.value);

    }
);



audio.addEventListener(
    "play",
    function() {

        playBtn.textContent =
            "❚❚";

    }
);



audio.addEventListener(
    "pause",
    function() {

        playBtn.textContent =
            "▶";

    }
);



audio.addEventListener(
    "ended",
    function() {

        if (repeat) {

            audio.currentTime = 0;

            audio.play();

        }

        else {

            nextSong();

        }

    }
);



searchInput.addEventListener(
    "input",
    function() {

        if (currentPage === "home") {

            showPage("songs");

        }


        renderSongs();

    }
);



navHome.addEventListener(
    "click",
    function() {

        showPage("home");

    }
);



navSongs.addEventListener(
    "click",
    function() {

        showPage("songs");

    }
);



navFavorites.addEventListener(
    "click",
    function() {

        showPage("favorites");

    }
);



navAbout.addEventListener(
    "click",
    function() {

        showPage("about");

    }
);



startListening.addEventListener(
    "click",
    function() {

        if (songs.length === 0) {

            openAddModal();

            return;

        }


        showPage("songs");

        playSong(0);

    }
);



window.addEventListener(
    "click",
    function(event) {

        if (event.target === addModal) {

            closeAddMusicModal();

        }


        if (event.target === deleteModal) {

            closeDeleteModal();

        }

    }
);



async function initialize() {

    setGreeting();


    try {

        await openDatabase();

        songs =
            await getAllSongs();

        renderRecent();

        renderSongs();

    }

    catch (error) {

        console.error(
            "Database error:",
            error
        );

        alert(
            "HE gagal membuka database."
        );

    }

}



initialize();



/* PWA */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register("./sw.js")
                .then(function() {

                    console.log(
                        "HE PWA aktif"
                    );

                })
                .catch(function(error) {

                    console.log(
                        "Service Worker gagal:",
                        error
                    );

                });

        }
    );

}