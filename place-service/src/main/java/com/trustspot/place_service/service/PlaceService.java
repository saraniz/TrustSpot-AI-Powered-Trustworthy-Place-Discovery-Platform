package com.trustspot.place_service.service;

import com.trustspot.place_service.model.Place;
import com.trustspot.place_service.repository.PlaceRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    public Place getPlaceById(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found with id " + id));
    }

    public Place createPlace(Place place) {
        return placeRepository.save(place);
    }

    public Place updatePlace(Long id, Place placeDetails) {
        Place place = getPlaceById(id);
        if (placeDetails.getName() != null) place.setName(placeDetails.getName());
        if (placeDetails.getDescription() != null) place.setDescription(placeDetails.getDescription());
        if (placeDetails.getAddress() != null) place.setAddress(placeDetails.getAddress());
        if (placeDetails.getLatitude() != null) place.setLatitude(placeDetails.getLatitude());
        if (placeDetails.getLongitude() != null) place.setLongitude(placeDetails.getLongitude());
        if (placeDetails.getCategory() != null) place.setCategory(placeDetails.getCategory());
        if (placeDetails.getImageUrls() != null) place.setImageUrls(placeDetails.getImageUrls());
        if (placeDetails.getUserId() != null) place.setUserId(placeDetails.getUserId());
        return placeRepository.save(place);
    }

    public void deletePlace(Long id) {
        Place place = getPlaceById(id);
        placeRepository.delete(place);
    }

    public List<Place> searchPlaces(String query) {
        return placeRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                query, query, query);
    }
}
