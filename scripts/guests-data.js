// 40 guests for demo wedding - complete small wedding
module.exports.createDemoGuests = (weddingId, demoUserId) => {
  const guests = [];
  
  // Rodina nevěsty (10 hostů)
  const brideFamily = [
    { firstName: 'Marie', lastName: 'Nováková', email: 'marie.novakova@email.cz', phone: '+420 777 123 456', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Josef', lastName: 'Novák', email: 'josef.novak@email.cz', phone: '+420 777 123 457', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Anna', lastName: 'Dvořáková', email: 'anna.dvorakova@email.cz', phone: '+420 777 123 458', hasPlusOne: true, plusOneName: 'Tomáš Dvořák', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Lucie', lastName: 'Černá', email: 'lucie.cerna@email.cz', phone: '+420 777 123 459', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: ['vegetarian'], accommodationInterest: 'not_interested' },
    { firstName: 'Petr', lastName: 'Procházka', email: 'petr.prochazka@email.cz', phone: '+420 777 123 460', hasPlusOne: true, plusOneName: 'Kateřina Procházková', plusOneRsvpStatus: 'attending', hasChildren: true, children: [{ name: 'Jakub Procházka', age: 5 }, { name: 'Eliška Procházková', age: 3 }], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'rodinný pokoj' },
    { firstName: 'Martina', lastName: 'Horáková', email: 'martina.horakova@email.cz', phone: '+420 777 123 461', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Václav', lastName: 'Kučera', email: 'vaclav.kucera@email.cz', phone: '+420 777 123 462', hasPlusOne: true, plusOneName: 'Hana Kučerová', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Zdeňka', lastName: 'Veselá', email: 'zdenka.vesela@email.cz', phone: '+420 777 123 463', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: ['gluten-free'], accommodationInterest: 'not_interested' },
    { firstName: 'Miroslav', lastName: 'Beneš', email: 'miroslav.benes@email.cz', phone: '+420 777 123 464', hasPlusOne: true, plusOneName: 'Ivana Benešová', plusOneRsvpStatus: 'attending', hasChildren: true, children: [{ name: 'Marek Beneš', age: 6 }], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'rodinný pokoj' },
    { firstName: 'Radka', lastName: 'Pokorná', email: 'radka.pokorna@email.cz', phone: '+420 777 123 465', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' }
  ];

  // Rodina ženicha (10 hostů)
  const groomFamily = [
    { firstName: 'Jan', lastName: 'Novák', email: 'jan.novak@email.cz', phone: '+420 777 234 567', hasPlusOne: true, plusOneName: 'Eva Nováková', plusOneRsvpStatus: 'attending', hasChildren: true, children: [{ name: 'Tomáš Novák', age: 8 }], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'rodinný pokoj' },
    { firstName: 'Pavel', lastName: 'Novotný', email: 'pavel.novotny@email.cz', phone: '+420 777 234 568', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Lenka', lastName: 'Malá', email: 'lenka.mala@email.cz', phone: '+420 777 234 569', hasPlusOne: true, plusOneName: 'Martin Malý', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Jiří', lastName: 'Král', email: 'jiri.kral@email.cz', phone: '+420 777 234 570', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Alena', lastName: 'Růžičková', email: 'alena.ruzickova@email.cz', phone: '+420 777 234 571', hasPlusOne: true, plusOneName: 'David Růžička', plusOneRsvpStatus: 'attending', hasChildren: true, children: [{ name: 'Natálie Růžičková', age: 4 }], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'rodinný pokoj' },
    { firstName: 'Stanislav', lastName: 'Pospíšil', email: 'stanislav.pospisil@email.cz', phone: '+420 777 234 572', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: ['lactose-free'], accommodationInterest: 'not_interested' },
    { firstName: 'Iveta', lastName: 'Jelínková', email: 'iveta.jelinkova@email.cz', phone: '+420 777 234 573', hasPlusOne: true, plusOneName: 'Michal Jelínek', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Robert', lastName: 'Fiala', email: 'robert.fiala@email.cz', phone: '+420 777 234 574', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Monika', lastName: 'Sedláčková', email: 'monika.sedlackova@email.cz', phone: '+420 777 234 575', hasPlusOne: true, plusOneName: 'Lukáš Sedláček', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Vladimír', lastName: 'Doležal', email: 'vladimir.dolezal@email.cz', phone: '+420 777 234 576', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' }
  ];

  // Přátelé (15 hostů)
  const friends = [
    { firstName: 'Petra', lastName: 'Svobodová', email: 'petra.svobodova@email.cz', phone: '+420 777 345 678', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: ['vegetarian'], accommodationInterest: 'not_interested', rsvpStatus: 'pending' },
    { firstName: 'Tomáš', lastName: 'Kolář', email: 'tomas.kolar@email.cz', phone: '+420 777 345 679', hasPlusOne: true, plusOneName: 'Simona Kolářová', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Barbora', lastName: 'Čermáková', email: 'barbora.cermakova@email.cz', phone: '+420 777 345 680', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Jakub', lastName: 'Němec', email: 'jakub.nemec@email.cz', phone: '+420 777 345 681', hasPlusOne: true, plusOneName: 'Tereza Němcová', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Karolína', lastName: 'Marková', email: 'karolina.markova@email.cz', phone: '+420 777 345 682', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: ['vegan'], accommodationInterest: 'not_interested' },
    { firstName: 'Filip', lastName: 'Bláha', email: 'filip.blaha@email.cz', phone: '+420 777 345 683', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Veronika', lastName: 'Holubová', email: 'veronika.holubova@email.cz', phone: '+420 777 345 684', hasPlusOne: true, plusOneName: 'Ondřej Holub', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Daniel', lastName: 'Vlček', email: 'daniel.vlcek@email.cz', phone: '+420 777 345 685', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Kristýna', lastName: 'Konečná', email: 'kristyna.konecna@email.cz', phone: '+420 777 345 686', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Marek', lastName: 'Krejčí', email: 'marek.krejci@email.cz', phone: '+420 777 345 687', hasPlusOne: true, plusOneName: 'Nikola Krejčová', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Adéla', lastName: 'Urbanová', email: 'adela.urbanova@email.cz', phone: '+420 777 345 688', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Michal', lastName: 'Vaněk', email: 'michal.vanek@email.cz', phone: '+420 777 345 689', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Eliška', lastName: 'Bartošová', email: 'eliska.bartosova@email.cz', phone: '+420 777 345 690', hasPlusOne: true, plusOneName: 'Adam Bartoš', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'interested', accommodationType: 'dvoulůžkový pokoj' },
    { firstName: 'Ondřej', lastName: 'Kopecký', email: 'ondrej.kopecky@email.cz', phone: '+420 777 345 691', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Nikola', lastName: 'Musilová', email: 'nikola.musilova@email.cz', phone: '+420 777 345 692', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' }
  ];

  // Kolegové (5 hostů)
  const colleagues = [
    { firstName: 'Radek', lastName: 'Šimek', email: 'radek.simek@email.cz', phone: '+420 777 456 789', hasPlusOne: true, plusOneName: 'Jana Šimková', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Klára', lastName: 'Dvořáková', email: 'klara.dvorakova@email.cz', phone: '+420 777 456 790', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Martin', lastName: 'Hájek', email: 'martin.hajek@email.cz', phone: '+420 777 456 791', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Tereza', lastName: 'Poláková', email: 'tereza.polakova@email.cz', phone: '+420 777 456 792', hasPlusOne: true, plusOneName: 'Petr Polák', plusOneRsvpStatus: 'attending', hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' },
    { firstName: 'Lukáš', lastName: 'Moravec', email: 'lukas.moravec@email.cz', phone: '+420 777 456 793', hasPlusOne: false, hasChildren: false, children: [], dietaryRestrictions: [], accommodationInterest: 'not_interested' }
  ];

  // Process all guests
  const allGuestGroups = [
    { guests: brideFamily, category: 'family-bride' },
    { guests: groomFamily, category: 'family-groom' },
    { guests: friends, category: 'friends-bride' },
    { guests: colleagues, category: 'colleagues-bride' }
  ];

  allGuestGroups.forEach(group => {
    group.guests.forEach((guest, index) => {
      const daysAgo = 5 + Math.floor(Math.random() * 15);
      const guestData = {
        weddingId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        category: group.category,
        invitationType: 'ceremony-reception',
        rsvpStatus: guest.rsvpStatus || 'attending',
        rsvpDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        hasPlusOne: guest.hasPlusOne,
        hasChildren: guest.hasChildren,
        children: guest.children,
        dietaryRestrictions: guest.dietaryRestrictions,
        preferredContactMethod: index % 2 === 0 ? 'email' : 'phone',
        language: 'cs',
        accommodationInterest: guest.accommodationInterest,
        accommodationPayment: 'paid_by_guest',
        invitationSent: true,
        invitationMethod: 'sent',
        createdAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        createdBy: demoUserId
      };

      // Add optional fields only if they exist
      if (guest.plusOneName) {
        guestData.plusOneName = guest.plusOneName;
      }
      if (guest.plusOneRsvpStatus) {
        guestData.plusOneRsvpStatus = guest.plusOneRsvpStatus;
      }
      if (guest.accommodationType) {
        guestData.accommodationType = guest.accommodationType;
      }

      guests.push(guestData);
    });
  });

  return guests;
};

