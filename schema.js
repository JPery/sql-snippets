async function createSchema(db) {
    // Taken from: https://gist.github.com/jasonrdsouza/00c46c4e541a540463587c0999ae6a78
    const query = `
    SELECT '
    digraph structs {
        '
        UNION ALL
        SELECT '
        rankdir="LR"
        '
        UNION ALL
        SELECT '
        node [shape=none]
        '
        UNION ALL
        SELECT
            CASE
        WHEN LAG(t.name, 1) OVER (ORDER BY t.name) = t.name THEN ''
        ELSE
                    t.name || ' [label=<
                    <TABLE BORDER="0" CELLSPACING="0" CELLBORDER="1">
                        <TR>
                            <TD COLSPAN="2"><B>' || t.name || '</B></TD>
                        </TR>
                    '
            END || '
                        <TR>
                            <TD PORT="' || i.name || '_to">' ||
                                CASE i.pk WHEN 0 THEN '&nbsp;' ELSE '&#128273; ' END ||
                            '</TD>
                            <TD PORT="' || i.name || '_from">' || i.name || '</TD>
                        </TR>
                    ' ||
            CASE
                WHEN LEAD(t.name, 1) OVER (ORDER BY t.name) = t.name THEN ''
        ELSE '
                    </TABLE>
                >];
                '
            END
        FROM pragma_table_list() AS t
            JOIN pragma_table_info(t.name, t.schema) AS i
        WHERE
         t.name NOT LIKE 'sqlite_%'
        AND t.type = 'table'
        UNION ALL
        SELECT
            t.name || ':' || f."from" || '_from:e -> ' ||
            f."table" || ':' || f."to" || '_to:w'
        FROM pragma_table_list() AS t
            JOIN pragma_foreign_key_list(t.name, t.schema) AS f
        UNION ALL
        SELECT '
    }';`
    const graphviz = db.exec(query)[0].values.join("\n");
    // Using Viz.js from: https://github.com/mdaines/viz-js
    Viz.instance().then(function (viz) {
        const graphDiv = document.getElementById("graph");
        graphDiv.innerHTML = '';
        const svg = viz.renderSVGElement(graphviz);
        svg.style.margin = "0 auto";
        svg.style.display = "block";
        graphDiv.appendChild(svg);
    });
}