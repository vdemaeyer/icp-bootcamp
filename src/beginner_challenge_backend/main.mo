import Nat "mo:base/Nat";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Array "mo:base/Array";


actor {
    type Profile = {
        id: Principal;
        name: Text;
    };


    type Note = Text;

    // In-memory user storage: Principal -> Profile
    var userProfiles = HashMap.HashMap<Principal, Profile>(10, Principal.equal, Principal.hash);

    // In-memory notes storage: Principal -> [Note]
    var userNotes = HashMap.HashMap<Principal, [Note]>(10, Principal.equal, Principal.hash);

    // Get user profile
    public query ({ caller }) func getUserProfile() : async Result.Result<Profile, Text> {
        switch (userProfiles.get(caller)) {
            case (?profile) { #ok(profile) };
            case null { #err("User profile not found") };
        }
    };

    // Set user profile
    public shared ({ caller }) func setUserProfile(name : Text) : async Result.Result<Profile, Text> {
        let profile : Profile = {
            id = caller;
            name = name;
        };
        userProfiles.put(caller, profile);
        #ok(profile)
    };

    // Add a note
    public shared ({ caller }) func addNote(note : Note) : async Result.Result<[Note], Text> {
        let existingNotes = switch (userNotes.get(caller)) {
            case (?notes) notes;
            case null [];
        };
        let updatedNotes = Array.append(existingNotes, [note]);
        userNotes.put(caller, updatedNotes);
        #ok(updatedNotes)
    };

    // Get user notes
    public query ({ caller }) func getNotes() : async Result.Result<[Note], Text> {
        switch (userNotes.get(caller)) {
            case (?notes) #ok(notes);
            case null #ok([]);
        }
    };
};
