import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BottomNav = () => {
    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tab}><Text>Tab 1</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tab}><Text>Tab 2</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addButton}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tab}><Text>Tab 3</Text></TouchableOpacity>
                <TouchableOpacity style={styles.tab}><Text>Tab 4</Text></TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10
    },
    tab: {
        flex: 1,
        alignItems: 'center'
    },
    addButton: {
        backgroundColor: '#ff4081',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24
    }
});

export default BottomNav;
