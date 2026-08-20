const CONFIG = {

    host:
        "419f80bf9fe7493f984ad0a01e48ffd5.s1.eu.hivemq.cloud",

    wsPort:
        8884,

    path:
        "/mqtt",

    // GANTI dengan credential Subscribe Only
    username:
        "putra.jaya.swasta_SUBSCRIBE",

    password:
        "putra.jaya.swasta",

    prefix:
        "bms"
};


// ============================================================
// TIMEOUT PACK
// ============================================================

const PACK_TIMEOUT =
    10000;


// ============================================================
// STORAGE
// ============================================================

const packs =
    {};

let activeSession =
    null;

let selected =
    null;


// ============================================================
// HELPERS
// ============================================================

const $ =
    id =>
        document.getElementById(
            id
        );

const fmt =
    (
        value,
        decimals = 2
    ) => {

        return Number.isFinite(
            Number(value)
        )
            ? Number(
                value
            ).toFixed(
                decimals
            )
            : "-";
    };


// ============================================================
// SERVER STATUS
// ============================================================

function setServer(
    online
)
{
    $("serverStatus")
        .className =
        "server " +
        (
            online
                ? "online"
                : ""
        );

    $("serverStatus")
        .textContent =
        online
            ? "● Server Terhubung"
            : "● Server Terputus";
}


// ============================================================
// CLEAR PACKS
// ============================================================

function clearPacks()
{
    Object.keys(
        packs
    ).forEach(
        key => {
            delete packs[key];
        }
    );

    selected =
        null;

    $("modal")
        .classList
        .add(
            "hidden"
        );

    render();
}


// ============================================================
// CREATE PACK
// ============================================================

function ensurePack(
    id
)
{
    if (!packs[id])
    {
        packs[id] = {

            id,

            lastSeen:
                Date.now(),

            data: {},

            cells: [],

            temps: [],

            history: []
        };
    }

    return packs[id];
}


// ============================================================
// RENDER
// ============================================================

function render()
{
    const grid =
        $("grid");

    const ids =
        Object.keys(
            packs
        ).sort(
            (
                a,
                b
            ) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric:
                            true
                    }
                )
        );

    $("empty")
        .style
        .display =
            ids.length
                ? "none"
                : "block";

    grid.innerHTML =
        ids.map(
            id => {

                const p =
                    packs[id];

                const d =
                    p.data ||
                    {};

                const c =
                    p.cells ||
                    [];

                const soc =
                    Number(
                        d.soc
                    );

                const min =
                    c.length
                        ? Math.min(
                            ...c
                        )
                        : null;

                const max =
                    c.length
                        ? Math.max(
                            ...c
                        )
                        : null;

                const delta =
                    min !== null &&
                    max !== null
                        ? (
                            max - min
                        ) * 1000
                        : null;

                const power =
                    Number.isFinite(
                        Number(
                            d.current
                        )
                    ) &&
                    Number.isFinite(
                        Number(
                            d.total_voltage
                        )
                    )
                        ? Number(
                            d.current
                        ) *
                          Number(
                            d.total_voltage
                          )
                        : null;

                return `
                <article
                    class="card"
                    onclick="openPack('${id}')"
                >

                    <div class="card-head">

                        <span>
                            ${id}
                        </span>

                        <span
                            class="dot online"
                        ></span>

                    </div>

                    <div class="soc">

                        <div class="soc-row">

                            <span>
                                SOC
                            </span>

                            <b>
                                ${
                                    Number.isFinite(
                                        soc
                                    )
                                        ? fmt(
                                            soc,
                                            0
                                          ) +
                                          "%"
                                        : "-"
                                }
                            </b>

                        </div>

                        <div class="progress">

                            <span
                                style="
                                    width:
                                    ${
                                        Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                Number.isFinite(
                                                    soc
                                                )
                                                    ? soc
                                                    : 0
                                            )
                                        )
                                    }%
                                "
                            ></span>

                        </div>

                    </div>

                    <div class="metrics">

                        <div class="metric">

                            <small>
                                ⚡ Voltage
                            </small>

                            <b class="yellow">
                                ${
                                    fmt(
                                        d.total_voltage
                                    )
                                }
                                V
                            </b>

                        </div>

                        <div class="metric">

                            <small>
                                ↻ Current
                            </small>

                            <b class="blue">
                                ${
                                    fmt(
                                        d.current
                                    )
                                }
                                A
                            </b>

                        </div>

                        <div class="metric">

                            <small>
                                🔵 Diff Cell
                            </small>

                            <b class="blue">

                                ${
                                    delta === null
                                        ? "-"
                                        : fmt(
                                            delta,
                                            0
                                          ) +
                                          " mV"
                                }

                            </b>

                        </div>

                        <div class="metric">

                            <small>
                                ⚡ Power
                            </small>

                            <b class="red">

                                ${
                                    power === null
                                        ? "-"
                                        : fmt(
                                            power,
                                            1
                                          ) +
                                          " W"
                                }

                            </b>

                        </div>

                        <div class="metric">

                            <small>
                                🔴 Min Cell
                            </small>

                            <b class="red">

                                ${
                                    min === null
                                        ? "-"
                                        : fmt(
                                            min,
                                            3
                                          ) +
                                          " V"
                                }

                            </b>

                        </div>

                        <div class="metric">

                            <small>
                                🟢 Max Cell
                            </small>

                            <b class="green">

                                ${
                                    max === null
                                        ? "-"
                                        : fmt(
                                            max,
                                            3
                                          ) +
                                          " V"
                                }

                            </b>

                        </div>

                    </div>

                </article>
                `;
            }
        ).join(
            ""
        );
}


// ============================================================
// OPEN PACK
// ============================================================

function openPack(
    id
)
{
    const p =
        packs[id];

    if (!p)
    {
        return;
    }

    selected =
        id;

    const d =
        p.data ||
        {};

    const c =
        p.cells ||
        [];

    const t =
        p.temps ||
        [];

    $("detailTitle")
        .textContent =
        id;

    $("detailDot")
        .className =
        "dot online";

    $("dSoh")
        .textContent =
        d.soh == null
            ? "-"
            : fmt(
                d.soh,
                0
              ) +
              " %";

    $("dRemain")
        .textContent =
        d.remaining_capacity == null
            ? "-"
            : fmt(
                d.remaining_capacity,
                2
              ) +
              " Ah";

    $("dNominal")
        .textContent =
        d.nominal_capacity == null
            ? "-"
            : fmt(
                d.nominal_capacity,
                2
              ) +
              " Ah";

    $("dCycles")
        .textContent =
        d.cycles == null
            ? "-"
            : d.cycles;


    // Temperatures
    [
        "t0",
        "t1",
        "t2",
        "t3"
    ].forEach(
        (
            id2,
            i
        ) => {

            $(
                id2
            ).textContent =
                t[i] == null
                    ? "-"
                    : fmt(
                        t[i],
                        1
                      ) +
                      " °C";

        }
    );


    // Cells
    const min =
        c.length
            ? Math.min(
                ...c
              )
            : null;

    const max =
        c.length
            ? Math.max(
                ...c
              )
            : null;


    $("cells")
        .innerHTML =
            c.length
                ? c.map(
                    (
                        value,
                        index
                    ) => {

                        return `
                        <div
                            class="
                                cell
                                ${
                                    value === min
                                        ? "min"
                                        : ""
                                }
                                ${
                                    value === max
                                        ? "max"
                                        : ""
                                }
                            "
                        >

                            <small>
                                C-${index + 1}
                            </small>

                            <b>
                                ${
                                    fmt(
                                        value,
                                        3
                                    )
                                }
                                V
                            </b>

                        </div>
                        `;

                    }
                  ).join(
                      ""
                  )
                : "<div>Belum ada data cell</div>";


    // Power
    const power =
        Number.isFinite(
            Number(
                d.current
            )
        ) &&
        Number.isFinite(
            Number(
                d.total_voltage
            )
        )
            ? Number(
                d.current
              ) *
              Number(
                d.total_voltage
              )
            : null;


    $("dVoltage")
        .textContent =
        d.total_voltage == null
            ? "-"
            : fmt(
                d.total_voltage
              ) +
              " V";

    $("dCurrent")
        .textContent =
        d.current == null
            ? "-"
            : fmt(
                d.current
              ) +
              " A";

    $("dPower")
        .textContent =
        power == null
            ? "-"
            : fmt(
                power,
                1
              ) +
              " W";

    $("dDelta")
        .textContent =
        min == null
            ? "-"
            : fmt(
                (
                    max - min
                ) * 1000,
                0
              ) +
              " mV";

    $("dMin")
        .textContent =
        min == null
            ? "-"
            : fmt(
                min,
                3
              ) +
              " V";

    $("dMax")
        .textContent =
        max == null
            ? "-"
            : fmt(
                max,
                3
              ) +
              " V";

    $("dAlarm")
        .textContent =
        d.alarm
            ? "ALARM"
            : "NORMAL";

    $("dAlarm")
        .className =
        d.alarm
            ? "red"
            : "green";


    $("modal")
        .classList
        .remove(
            "hidden"
        );


    drawChart(
        p.history ||
        []
    );
}

window.openPack =
    openPack;


// ============================================================
// CHART
// ============================================================

function drawChart(
    values
)
{
    const cv =
        $("chart");

    const ctx =
        cv.getContext(
            "2d"
        );

    ctx.clearRect(
        0,
        0,
        cv.width,
        cv.height
    );

    ctx.strokeStyle =
        "#29313d";

    ctx.lineWidth =
        1;

    for (
        let i = 0;
        i < 6;
        i++
    )
    {
        const y =
            20 +
            i *
            (
                cv.height -
                45
            ) /
            5;

        ctx.beginPath();

        ctx.moveTo(
            30,
            y
        );

        ctx.lineTo(
            cv.width -
            10,
            y
        );

        ctx.stroke();
    }

    if (
        !values.length
    )
    {
        return;
    }

    const min =
        Math.min(
            ...values
        );

    const max =
        Math.max(
            ...values
        );

    const range =
        Math.max(
            0.01,
            max - min
        );

    ctx.strokeStyle =
        "#facc15";

    ctx.lineWidth =
        2;

    ctx.beginPath();

    values.forEach(
        (
            value,
            index
        ) => {

            const x =
                30 +
                index *
                (
                    cv.width -
                    40
                ) /
                Math.max(
                    1,
                    values.length -
                    1
                );

            const y =
                15 +
                (
                    max -
                    value
                ) /
                range *
                (
                    cv.height -
                    45
                );

            if (
                index === 0
            )
            {
                ctx.moveTo(
                    x,
                    y
                );
            }
            else
            {
                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );

    ctx.stroke();
}


// ============================================================
// MQTT MESSAGE
// ============================================================

function handleMessage(
    topic,
    message
)
{
    const payload =
        message.toString();

    // --------------------------------------------------------
    // MASTER STATUS
    // --------------------------------------------------------

    if (
        topic ===
        "bms/master/status"
    )
    {
        try
        {
            const obj =
                JSON.parse(
                    payload
                );

            // ESP OFFLINE
            if (
                obj.status ===
                "offline"
            )
            {
                clearPacks();

                activeSession =
                    null;

                setServer(
                    false
                );

                return;
            }

            // ESP ONLINE
            if (
                obj.status ===
                "online" &&
                obj.session
            )
            {
                if (
                    activeSession !==
                    obj.session
                )
                {
                    activeSession =
                        obj.session;

                    clearPacks();
                }

                setServer(
                    true
                );
            }

        }
        catch (
            error
        )
        {
            return;
        }

        return;
    }


    // --------------------------------------------------------
    // PACK TOPIC
    // --------------------------------------------------------

    const parts =
        topic.split(
            "/"
        );

    const index =
        parts.findIndex(
            value =>
                /^PACK-/i.test(
                    value
                )
        );

    if (
        index < 0
    )
    {
        return;
    }

    // Belum ada session aktif
    if (
        !activeSession
    )
    {
        return;
    }


    const packId =
        parts[index]
            .toUpperCase();

    const type =
        parts[
            index + 1
        ] ||
        "";


    let obj;

    try
    {
        obj =
            JSON.parse(
                payload
            );
    }
    catch (
        error
    )
    {
        return;
    }


    // --------------------------------------------------------
    // IGNORE RETAINED DATA DARI SESSION LAMA
    // --------------------------------------------------------

    if (
        obj.session !==
        activeSession
    )
    {
        return;
    }


    const p =
        ensurePack(
            packId
        );

    p.lastSeen =
        Date.now();


    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (
        type ===
        "status"
    )
    {
        if (
            String(
                obj
            ).toLowerCase() ===
            "offline"
        )
        {
            delete packs[
                packId
            ];
        }
    }


    // --------------------------------------------------------
    // DATA
    // --------------------------------------------------------

    else if (
        type ===
        "data"
    )
    {
        p.data =
            obj;

        p.lastSeen =
            Date.now();


        const voltage =
            Number(
                obj.total_voltage
            );

        if (
            Number.isFinite(
                voltage
            )
        )
        {
            p.history.push(
                voltage
            );

            if (
                p.history.length >
                60
            )
            {
                p.history.shift();
            }
        }
    }


    // --------------------------------------------------------
    // CELLS
    // --------------------------------------------------------

    else if (
        type ===
        "cells"
    )
    {
        p.cells =
            Array.isArray(
                obj
            )
                ? obj
                : (
                    obj.cells ||
                    []
                );
    }


    // --------------------------------------------------------
    // TEMPERATURE
    // --------------------------------------------------------

    else if (
        type ===
        "temperature"
    )
    {
        p.temps =
            Array.isArray(
                obj
            )
                ? obj
                : (
                    obj.temperatures ||
                    []
                );
    }


    render();


    if (
        selected ===
        packId &&
        !$("modal")
            .classList
            .contains(
                "hidden"
            )
    )
    {
        openPack(
            packId
        );
    }
}


// ============================================================
// REMOVE STALE PACK
// ============================================================

function removeStalePacks()
{
    const now =
        Date.now();

    let changed =
        false;


    Object.keys(
        packs
    ).forEach(
        id => {

            if (
                !packs[id].lastSeen ||
                now -
                packs[id].lastSeen >
                PACK_TIMEOUT
            )
            {
                delete packs[
                    id
                ];

                changed =
                    true;

                if (
                    selected ===
                    id
                )
                {
                    selected =
                        null;

                    $("modal")
                        .classList
                        .add(
                            "hidden"
                        );
                }
            }
        }
    );


    if (
        changed
    )
    {
        render();
    }
}


// ============================================================
// MODAL
// ============================================================

$("closeModal")
    .onclick =
    () => {

        $("modal")
            .classList
            .add(
                "hidden"
            );

        selected =
            null;
    };


$("modal")
    .onclick =
    event => {

        if (
            event.target ===
            $("modal")
        )
        {
            $("closeModal")
                .click();
        }
    };


// ============================================================
// TIMER
// ============================================================

setInterval(
    removeStalePacks,
    1000
);


// ============================================================
// MQTT CONNECT
// ============================================================

function connect()
{
    const url =
        `wss://${CONFIG.host}:${CONFIG.wsPort}${CONFIG.path}`;


    const client =
        mqtt.connect(
            url,
            {
                username:
                    CONFIG.username,

                password:
                    CONFIG.password,

                clean:
                    true,

                reconnectPeriod:
                    5000,

                connectTimeout:
                    10000
            }
        );


    client.on(
        "connect",
        () => {

            setServer(
                true
            );


            client.subscribe(
                "bms/master/status",
                {
                    qos: 0
                }
            );


            client.subscribe(
                "bms/+/status",
                {
                    qos: 0
                }
            );


            client.subscribe(
                "bms/+/data",
                {
                    qos: 0
                }
            );


            client.subscribe(
                "bms/+/cells",
                {
                    qos: 0
                }
            );


            client.subscribe(
                "bms/+/temperature",
                {
                    qos: 0
                }
            );
        }
    );


    client.on(
        "reconnect",
        () => {
            setServer(
                false
            );
        }
    );


    client.on(
        "offline",
        () => {
            setServer(
                false
            );
        }
    );


    client.on(
        "error",
        () => {
            setServer(
                false
            );
        }
    );


    client.on(
        "message",
        handleMessage
    );
}


// ============================================================
// START
// ============================================================

render();

connect();
