export class RenovateParserService {

    static parsePRTitle(
        title: string
    ) {

        const regex =
            /update (.+?) to v?([\d.]+)/i;

        const match =
            title.match(regex);

        if (!match) {

            return null;
        }

        const dependency =
            match[1];

        const version =
            match[2];

        if (!dependency || !version) {

            return null;
        }

        return {
            dependency,
            version
        };
    }
}
