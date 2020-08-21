<table>
    <tbody>
{{ REPOSITORIES: }}
        <tr>
            <td>{{ STARS }} ⭐</td>
            <td>{{ NAME }}</td>
            <td>{{ DESCRIPTION }}</td>
        </tr>
{{ /REPOSITORIES }}
    </tbody>
</table>

|Stars|Name|Description|
|---|---|---|
{{ REPOSITORIES: }}
| {{ STARS }} | {{ NAME }} | {{ DESCRIPTION }} |
{{ /REPOSITORIES }}
